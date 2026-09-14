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
        <h3 className="text-sm font-semibold">この判定をレビューする</h3>
        {existing && <span className="text-xs text-muted">レビュー済み(上書き可)</span>}
      </div>
      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-2"><input type="radio" name="agree" value="yes" checked={agree} onChange={() => setAgree(true)} /> 判定は正しい</label>
        <label className="flex items-center gap-2"><input type="radio" name="agree" value="no" checked={!agree} onChange={() => setAgree(false)} /> 判定に誤りがある</label>
      </div>

      {!agree && (
        <div className="space-y-3 rounded-md border border-border p-3">
          <div>
            <label className="label">正しい総合点</label>
            <select className="input max-w-[200px]" name="correctedScore" defaultValue={existing?.correctedScore ?? out.overall.score}>
              {strategy.verdicts.map((v) => <option key={v.score} value={v.score}>{v.score} — {v.label}</option>)}
            </select>
          </div>
          <div>
            <p className="label">訂正する要素(変更するものだけ選ぶ)</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {strategy.axes.flatMap((a) => a.elements).map((el) => {
                const ai = out.axes.flatMap((a) => a.elements).find((e) => e.key === el.key)?.mark ?? "—";
                return (
                  <label key={el.key} className="text-xs">
                    <span className="font-mono">{el.key}</span> {el.label} <span className="text-muted">(AI: {ai})</span>
                    <select className="input mt-1" name={`el_${el.key}`} defaultValue={existing?.correctedElements?.[el.key] ?? ""}>
                      <option value="">変更なし</option>
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
        <label className="label">{agree ? "同意の理由・補足(何が正しく読めていたか)" : "訂正理由(何を見落とした/過大・過小評価したか) ※最重要"}</label>
        <textarea className="input" name="comment" rows={4} required defaultValue={existing?.comment ?? ""} placeholder="例: 200EMA到達は実質1本で接触ゾーン3本未満。R=未確定であり特則は発動しない。張り付き認定は過大。" />
      </div>
      <label className="flex items-center gap-2 text-xs text-muted">
        <input type="checkbox" name="useAsExample" value="yes" defaultChecked={existing?.useAsExample ?? true} /> 今後の判定の校正例として使う
      </label>
      <button className="btn-primary">レビューを保存</button>
    </form>
  );
}
