import type { StrategyDefinition } from "@/strategies/types";
import type { EvaluationOutput } from "@/lib/evaluator/schema";
import { Mark, ScoreBadge } from "./ScoreBadge";

export function EvaluationView({ strategy, out, corrected }: { strategy: StrategyDefinition; out: EvaluationOutput; corrected?: Record<string, string> | null }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <ScoreBadge score={out.overall.score} label={out.overall.label} size="lg" />
        <span className="text-sm text-muted">{out.direction}</span>
      </div>

      <section>
        <h3 className="mb-2 text-sm font-semibold">観察</h3>
        <table className="w-full text-sm">
          <tbody>
            {strategy.observations.map((o) => (
              <tr key={o.key} className="border-t border-border">
                <td className="w-28 py-1.5 pr-3 align-top text-muted">{o.key} {o.label}</td>
                <td className="py-1.5">{out.observations.find((x) => x.key === o.key)?.text ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {strategy.axes.map((axis, i) => {
          const a = out.axes.find((x) => x.key === axis.key);
          return (
            <section key={axis.key} className="card">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold">軸{i + 1}: {axis.label}</h3>
                {a && <ScoreBadge score={a.score} size="sm" />}
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {axis.elements.map((el) => {
                    const e = a?.elements.find((x) => x.key === el.key);
                    const fix = corrected?.[el.key];
                    return (
                      <tr key={el.key} className="border-t border-border">
                        <td className="w-28 py-1.5 pr-2 align-top">
                          <span className="font-mono text-xs text-muted">{el.key}</span> {el.label}
                          {el.core && <span className="ml-1 text-[10px] text-muted">中核</span>}
                        </td>
                        <td className="w-12 py-1.5 text-center">
                          <Mark mark={e?.mark ?? "—"} />
                          {fix && fix !== e?.mark && <span className="ml-1 text-xs">→ <Mark mark={fix} /></span>}
                        </td>
                        <td className="py-1.5 text-xs">{e?.reason}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {a?.note && <p className="mt-2 text-xs text-muted whitespace-pre-line">{a.note}</p>}
            </section>
          );
        })}
      </div>

      <section className="card">
        <h3 className="mb-2 text-sm font-semibold">総合評価 — {out.overall.score}/5({out.overall.label})</h3>
        <table className="w-full text-sm">
          <tbody>
            {[
              ["ゲート", out.overall.gate],
              ["特則", out.overall.specialRule],
              ...(strategy.overallExtraRows ?? []).map((r) => [r.label, out.overall.extra?.find((x) => x.key === r.key)?.value ?? "—"]),
              ["主因", out.overall.mainCause],
              [strategy.higherTfLabel ?? "STEP 0", out.overall.step0],
            ].map(([k, v]) => (
              <tr key={k} className="border-t border-border"><td className="w-20 py-1.5 text-muted">{k}</td><td className="py-1.5">{v}</td></tr>
            ))}
          </tbody>
        </table>
        {out.overall.score <= 3 && out.improvements.length > 0 && (
          <div className="mt-3">
            <h4 className="mb-1 text-xs font-semibold">改善提案</h4>
            <table className="w-full text-sm">
              <tbody>
                {out.improvements.map((im, i) => (
                  <tr key={i} className="border-t border-border"><td className="w-1/3 py-1.5">{im.weakness}</td><td className="py-1.5 text-muted">{im.trigger}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
