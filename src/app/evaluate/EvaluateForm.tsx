"use client";
import { useEffect, useState, useTransition } from "react";
import type { StrategyDefinition } from "@/strategies/types";
import { createAndEvaluate } from "./actions";
import { shrinkFormImages } from "@/lib/image-client";

type Props = { strategies: Pick<StrategyDefinition, "id" | "name" | "execTimeframes" | "higherTimeframes" | "higherTfLabel" | "numericPlaceholder">[] };

export function EvaluateForm({ strategies }: Props) {
  const [strategyId, setStrategyId] = useState(strategies[0]?.id ?? "");
  const strategy = strategies.find((s) => s.id === strategyId) ?? strategies[0];
  const [execTf, setExecTf] = useState(strategy?.execTimeframes[0] ?? "5m");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!pending) { setElapsed(0); return; }
    const t = setInterval(() => setElapsed((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [pending]);

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  }

  return (
    <form
      className="grid gap-6 md:grid-cols-[1fr_320px]"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setError(null);
        start(async () => {
          try {
            await shrinkFormImages(fd, "execImages");
            await shrinkFormImages(fd, "higherImages");
            const result = await createAndEvaluate(fd);
            if (result?.error) setError(result.error);
          } catch (err) {
            if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) throw err;
            const msg = err instanceof Error ? err.message : "Evaluation failed";
            setError(msg.includes("#441") ? `Server error (the upload may be too large). Use fewer images or try again: ${msg}` : msg);
          }
        });
      }}
    >
      <div className="space-y-4">
        <div className="card space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="col-span-2">
              <label className="label">Strategy</label>
              <select className="input" name="strategyId" value={strategyId} onChange={(e) => { setStrategyId(e.target.value); const s = strategies.find((x) => x.id === e.target.value); if (s) setExecTf(s.execTimeframes[0]); }}>
                {strategies.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Execution TF</label>
              <select className="input" name="execTf" value={execTf} onChange={(e) => setExecTf(e.target.value)}>
                {strategy?.execTimeframes.map((tf) => <option key={tf} value={tf}>{tf}</option>)}
              </select>
              <p className="mt-1 text-[11px] text-muted">{strategy?.higherTfLabel ?? "STEP 0"}: {strategy?.higherTimeframes[execTf]?.join(", ")}</p>
            </div>
            <div>
              <label className="label">Direction</label>
              <select className="input" name="direction" defaultValue="">
                <option value="">Not specified</option>
                <option value="LONG">LONG</option>
                <option value="SHORT">SHORT</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Pair</label>
            <input className="input font-mono uppercase" name="pair" placeholder="XAUUSD" required />
          </div>
          <div>
            <label className="label">Execution-TF chart images (subject of evaluation; multiple allowed)</label>
            <input className="input" type="file" name="execImages" accept="image/*" multiple onChange={onFiles} />
            {previews.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {previews.map((p) => <img key={p} src={p} alt="" className="rounded border border-border" />)}
              </div>
            )}
          </div>
          <div>
            <label className="label">Higher-TF chart images (optional; reference for {strategy?.higherTfLabel ?? "STEP 0"})</label>
            <input className="input" type="file" name="higherImages" accept="image/*" multiple />
          </div>
        </div>
        <div className="card space-y-4">
          <div>
            <label className="label">Numeric data (optional, JSON)</label>
            <textarea className="input font-mono text-xs" name="numericData" rows={4} placeholder={strategy?.numericPlaceholder ?? '{"entry": 0, "sl": 0, "tp": 0}'} />
            <p className="mt-1 text-[11px] text-muted">Used to cross-check values such as the K4 retracement ratio r and the RRR. Images alone are enough to evaluate.</p>
          </div>
          <div>
            <label className="label">Notes (your entry rationale / self-analysis)</label>
            <textarea className="input" name="notes" rows={4} placeholder="The evaluation is done independently of your notes; agreement/disagreement is shown afterwards" />
          </div>
        </div>
      </div>
      <aside className="space-y-3">
        <div className="card space-y-3">
          <button className="btn-primary w-full" disabled={pending}>{pending ? `Evaluating… ${elapsed}s (usually 1–3 min)` : "Evaluate"}</button>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <p className="text-xs text-muted">Evaluations use the strategy docs as the sole criteria, and judgments you have corrected in the past are referenced as calibration examples.</p>
        </div>
      </aside>
    </form>
  );
}
