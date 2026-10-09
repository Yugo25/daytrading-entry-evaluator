import "server-only";
import type { StrategyDefinition } from "@/strategies/types";
import { readStrategyDocs } from "@/strategies/docs";
import { overallRow, type EvaluationOutput } from "./schema";

export interface FewShotExample {
  reviewId: string;
  pair: string;
  execTf: string;
  aiOutput: EvaluationOutput;
  agree: boolean;
  correctedScore: number | null;
  correctedElements: Record<string, string> | null;
  comment: string;
}

/**
 * System prompt = strategy docs (fixed, cached) + output rules.
 * The strategy docs are the yardstick for judgment and are never rewritten here.
 */
export function buildSystemPrompt(strategy: StrategyDefinition) {
  const docs = readStrategyDocs(strategy);
  const parts: string[] = [];
  parts.push(
    `You are an evaluator that judges whether an entry model complies with the criteria of the "${strategy.name}".`,
    "Use the strategy documents below (skill body and reference material) as the sole criteria for judgment. Do not loosen or tighten the criteria on your own.",
    "Do not evaluate in hindsight; base the evaluation only on information that could be judged before the break.",
    "Write all output text in English.",
    strategy.promptNotes ?? "",
    "",
  );
  for (const d of docs) {
    parts.push(`<document name="${d.name}" role="${d.role}">`, d.content, "</document>", "");
  }
  parts.push(
    "## Output rules",
    "- The output must strictly follow the specified JSON schema.",
    `- observations must include all of the following keys: ${strategy.observations.map((o) => o.key).join(", ")}`,
    `- axes must include all of ${strategy.axes.map((a) => `${a.key} (elements: ${a.elements.map((e) => e.key).join(",")})`).join(" / ")}.`,
    `- overall.label must be one of these fixed 5: ${strategy.verdicts.map((v) => v.label).join(" / ")}`,
    strategy.axes.length > 1 ? "- The overall score uses the gate method, capped at the lowest axis score. Special rules are invoked only when positively confirmed." : "- With a single axis, that axis score = the overall score (per the conversion table).",
    `- overall.rows must include all of the following keys, in this order: ${strategy.overallRows.map((r) => `${r.key} (${r.label}: ${r.hint})`).join(" / ")}`,
    "- improvements only when the overall is 3 or lower. Empty array if 4 or higher.",
  );
  return parts.join("\n");
}

/**
 * Pass past judgments and the user's corrections as "calibration examples".
 * The goal is not to change the strategy criteria but to correct reading accuracy against the same criteria (oversights, over/under-scoring).
 */
export function buildFewShotBlock(examples: FewShotExample[]) {
  if (!examples.length) return "";
  const lines: string[] = [
    "## User calibration of past judgments (reference examples)",
    "Below are past judgments and the corrections made to them by an expert in the strategy.",
    "Refer to them as patterns of oversight, over-scoring and under-scoring that occurred when applying the same criteria, and self-check that this judgment does not contain the same kind of error.",
    "The corrections only calibrate reading; they do not change the strategy criteria themselves.",
    "",
  ];
  for (const ex of examples) {
    const marks = ex.aiOutput.axes
      .map((a) => `${a.key}=${a.score} [${a.elements.map((e) => `${e.key}${e.mark}`).join(" ")}]`)
      .join(" / ");
    lines.push(`<example pair="${ex.pair}" tf="${ex.execTf}" verdict="${ex.agree ? "agree" : "disagree"}">`);
    lines.push(`AI judgment: overall ${ex.aiOutput.overall.score} ${ex.aiOutput.overall.label} / ${marks}`);
    lines.push(`Main cause: ${overallRow(ex.aiOutput, "mainCause")}`);
    if (!ex.agree) {
      if (ex.correctedScore != null) lines.push(`Correct overall score: ${ex.correctedScore}`);
      if (ex.correctedElements && Object.keys(ex.correctedElements).length)
        lines.push(`Corrected elements: ${Object.entries(ex.correctedElements).map(([k, v]) => `${k}→${v}`).join(", ")}`);
    }
    lines.push(`User comment: ${ex.comment}`);
    lines.push("</example>", "");
  }
  return lines.join("\n");
}
