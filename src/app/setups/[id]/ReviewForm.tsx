"use client";
import { useState } from "react";
import type { StrategyDefinition } from "@/strategies/types";
import type { EvaluationOutput } from "@/lib/evaluator/schema";
import { submitReview } from "./actions";

type Existing = { agree: boolean; correctedScore: number | null; correctedElements: Record<string, string> | null; comment: string; useAsExample: boolean } | null;

export function ReviewForm({ evaluationId, strategy, out, existing }: { evaluationId: string; strategy: StrategyDefinition; out: EvaluationOutput; existing: Existing }) {
  const [agree, setAgree] = useState<boolean>(existing?.agree ?? true);
  return (
    <form action={submitReview} className="card space-y-4">
      <input type="hidden" name="evaluationId" value={evaluationId} />
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Review this evaluation</h3>
        {existing && <span className="text-xs text-muted">Reviewed (can be overwritten)</span>}
      </div>
      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-2"><input type="radio" name="agree" value="yes" checked={agree} onChange={() => setAgree(true)} /> The evaluation is correct</label>
        <label className="flex items-center gap-2"><input type="radio" name="agree" value="no" checked={!agree} onChange={() => setAgree(false)} /> The evaluation has errors</label>
      </div>

      {!agree && (
        <div className="space-y-3 rounded-md border border-border p-3">
          <div>
            <label className="label">Correct overall score</label>
            <select className="input max-w-[200px]" name="correctedScore" defaultValue={existing?.correctedScore ?? out.overall.score}>
              {strategy.verdicts.map((v) => <option key={v.score} value={v.score}>{v.score} — {v.label}</option>)}
            </select>
          </div>
          <div>
            <p className="label">Elements to correct (select only the ones that change)</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {strategy.axes.flatMap((a) => a.elements).map((el) => {
                const ai = out.axes.flatMap((a) => a.elements).find((e) => e.key === el.key)?.mark ?? "—";
                return (
                  <label key={el.key} className="text-xs">
                    <span className="font-mono">{el.key}</span> {el.label} <span className="text-muted">(AI: {ai})</span>
                    <select className="input mt-1" name={`el_${el.key}`} defaultValue={existing?.correctedElements?.[el.key] ?? ""}>
                      <option value="">No change</option>
                      <option value="○">○</option>
                      <option value="△">△</option>
                      <option value="×">×</option>
                    </select>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="label">{agree ? "Why you agree / notes (what was read correctly)" : "Reason for correction (what was missed / over- or under-scored) *most important"}</label>
        <textarea className="input" name="comment" rows={4} required defaultValue={existing?.comment ?? ""} placeholder="e.g. The 200EMA was reached by effectively one candle, so the contact zone is under 3 candles. R = undetermined, so the special rule does not apply. Calling it clinging was an overreach." />
      </div>
      <label className="flex items-center gap-2 text-xs text-muted">
        <input type="checkbox" name="useAsExample" value="yes" defaultChecked={existing?.useAsExample ?? true} /> Use as a calibration example for future evaluations
      </label>
      <button className="btn-primary">Save review</button>
    </form>
  );
}
