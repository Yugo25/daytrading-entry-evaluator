"use client";
import { useState, useTransition } from "react";
import type { StrategyDefinition } from "@/strategies/types";
import { createAndEvaluate } from "./actions";

type Props = { strategies: Pick<StrategyDefinition, "id" | "name" | "execTimeframes" | "higherTimeframes">[] };

export function EvaluateForm({ strategies }: Props) {
  const [strategyId, setStrategyId] = useState(strategies[0]?.id ?? "");
  const strategy = strategies.find((s) => s.id === strategyId) ?? strategies[0];
  const [execTf, setExecTf] = useState(strategy?.execTimeframes[0] ?? "5m");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);

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
            await createAndEvaluate(fd);
          } catch (err) {
            if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) throw err;
            setError(err instanceof Error ? err.message : "判定に失敗しました");
          }
        });
      }}
    >
      <div className="space-y-4">
        <div className="card space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="col-span-2">
              <label className="label">手法</label>
              <select className="input" name="strategyId" value={strategyId} onChange={(e) => { setStrategyId(e.target.value); const s = strategies.find((x) => x.id === e.target.value); if (s) setExecTf(s.execTimeframes[0]); }}>
                {strategies.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">執行足</label>
              <select className="input" name="execTf" value={execTf} onChange={(e) => setExecTf(e.target.value)}>
                {strategy?.execTimeframes.map((tf) => <option key={tf} value={tf}>{tf}</option>)}
              </select>
              <p className="mt-1 text-[11px] text-muted">STEP 0: {strategy?.higherTimeframes[execTf]?.join("・")}</p>
            </div>
            <div>
              <label className="label">方向</label>
              <select className="input" name="direction" defaultValue="">
                <option value="">未指定</option>
                <option value="LONG">LONG</option>
                <option value="SHORT">SHORT</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">通貨ペア</label>
            <input className="input font-mono uppercase" name="pair" placeholder="XAUUSD" required />
          </div>
          <div>
            <label className="label">執行足チャート画像(評価対象・複数可)</label>
            <input className="input" type="file" name="execImages" accept="image/png,image/jpeg,image/webp" multiple onChange={onFiles} />
            {previews.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {previews.map((p) => <img key={p} src={p} alt="" className="rounded border border-border" />)}
              </div>
            )}
          </div>
          <div>
            <label className="label">上位足チャート画像(任意・STEP 0の参考)</label>
            <input className="input" type="file" name="higherImages" accept="image/png,image/jpeg,image/webp" multiple />
          </div>
        </div>
        <div className="card space-y-4">
          <div>
            <label className="label">数値データ(任意・JSON)</label>
            <textarea className="input font-mono text-xs" name="numericData" rows={4} placeholder='{"A": 1.9930, "B": 1.9905, "E": 1.9910, "X": 1.99194, "sl": 1.9900, "tp": 1.9990}' />
            <p className="mt-1 text-[11px] text-muted">K4の戻し率 r や RRR の検算に使われます。画像だけでも判定できます。</p>
          </div>
          <div>
            <label className="label">メモ(自分のエントリー根拠・自己分析)</label>
            <textarea className="input" name="notes" rows={4} placeholder="評価はメモから独立に行われ、評価後に一致/相違が示されます" />
          </div>
        </div>
      </div>
      <aside className="space-y-3">
        <div className="card space-y-3">
          <button className="btn-primary w-full" disabled={pending}>{pending ? "判定中…(30〜90秒)" : "判定する"}</button>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <p className="text-xs text-muted">判定は手法ドキュメントを唯一の基準に行われ、過去にあなたが訂正した判定が校正例として参照されます。</p>
        </div>
      </aside>
    </form>
  );
}
