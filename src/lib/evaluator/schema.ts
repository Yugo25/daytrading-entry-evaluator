import { z } from "zod";

// Generic, strategy-independent evaluation output. Element keys (S1, K4...) are validated against the strategy definition downstream.
export const MarkSchema = z.enum(["○", "△", "×"]);

export const EvaluationOutputSchema = z.object({
  direction: z.string().describe("Direction: long/short, line type and cross type, in one line"),
  observations: z.array(
    z.object({
      key: z.string().describe("Observation element key (①–⑤)"),
      text: z.string().describe("What was read (short sentence)"),
    }),
  ),
  axes: z.array(
    z.object({
      key: z.string().describe("Axis key (axis1, axis2)"),
      score: z.number().int().min(1).max(5),
      elements: z.array(
        z.object({
          key: z.string().describe("Element key (S1..S4, K1..K4)"),
          mark: MarkSchema,
          reason: z.string().describe("Basis: one line (about 15–40 characters)"),
        }),
      ),
      note: z.string().describe("2–3 lines of supplementary notes"),
    }),
  ),
  overall: z.object({
    score: z.number().int().min(1).max(5),
    label: z.string().describe("Verdict label (one of the strategy's fixed 5)"),
    rows: z
      .array(z.object({ key: z.string(), value: z.string() }))
      .describe("Rows of the basis table. Include every key specified in the output rules, in that order (mainCause: the one element that capped the overall score, in 15–40 characters)"),
  }),
  improvements: z
    .array(z.object({ weakness: z.string(), trigger: z.string() }))
    .describe("Only when the overall is 3 or lower. One row per △/× element, max 3 rows. Empty array if 4 or higher"),
});

export type EvaluationOutput = z.infer<typeof EvaluationOutputSchema>;

/** Let evaluations saved in the legacy format (fixed gate/specialRule/mainCause/step0) also be read as rows */
export function overallRows(out: EvaluationOutput): { key: string; value: string }[] {
  if (out.overall.rows) return out.overall.rows;
  const legacy = out.overall as unknown as Record<string, string>;
  return [
    { key: "gate", value: legacy.gate ?? "" },
    { key: "specialRule", value: legacy.specialRule ?? "" },
    { key: "mainCause", value: legacy.mainCause ?? "" },
    { key: "step0", value: legacy.step0 ?? "" },
  ];
}

export function overallRow(out: EvaluationOutput, key: string) {
  return overallRows(out).find((r) => r.key === key)?.value ?? "—";
}
