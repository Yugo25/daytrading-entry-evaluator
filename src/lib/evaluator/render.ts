import type { StrategyDefinition } from "@/strategies/types";
import { overallRow, type EvaluationOutput } from "./schema";

/** Convert the structured output into Markdown with the same structure as the skill's output template */
export function renderEvaluation(strategy: StrategyDefinition, out: EvaluationOutput): string {
  const lines: string[] = [];
  lines.push(`## ${strategy.resultTitle ?? "Evaluation Result"}`);
  lines.push(`Direction: ${out.direction}`);
  lines.push("");
  lines.push("### Observations");
  lines.push("| Element | Reading |");
  lines.push("|---|---|");
  for (const o of strategy.observations) {
    const found = out.observations.find((x) => x.key === o.key);
    lines.push(`| ${o.key} ${o.label} | ${found?.text ?? "—"} |`);
  }
  lines.push("");
  strategy.axes.forEach((axis, i) => {
    const a = out.axes.find((x) => x.key === axis.key);
    lines.push(`### Axis ${i + 1}: ${axis.label} — ${a?.score ?? "?"}/5`);
    lines.push("| Element | Mark | Basis |");
    lines.push("|---|---|---|");
    for (const el of axis.elements) {
      const e = a?.elements.find((x) => x.key === el.key);
      lines.push(`| ${el.key} ${el.label} | ${e?.mark ?? "—"} | ${e?.reason ?? ""} |`);
    }
    lines.push("");
    if (a?.note) lines.push(a.note, "");
  });
  lines.push(`### Overall Evaluation — ${out.overall.score}/5 (${out.overall.label})`);
  lines.push("| Basis | Content |");
  lines.push("|---|---|");
  for (const r of strategy.overallRows) lines.push(`| ${r.label} | ${overallRow(out, r.key)} |`);
  if (out.overall.score <= 3 && out.improvements.length) {
    lines.push("");
    lines.push("**Improvements**");
    lines.push("| Weakness | Improvement trigger |");
    lines.push("|---|---|");
    for (const im of out.improvements) lines.push(`| ${im.weakness} | ${im.trigger} |`);
  }
  return lines.join("\n");
}
