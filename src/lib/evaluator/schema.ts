import { z } from "zod";

// 手法に依存しない汎用の判定出力。要素キー(S1, K4...)の妥当性は strategy 定義に対して後段で検証する。
export const MarkSchema = z.enum(["○", "△", "×"]);

export const EvaluationOutputSchema = z.object({
  direction: z.string().describe("方向: ロング/ショート、ライン種別、クロス種別を1行で"),
  observations: z.array(
    z.object({
      key: z.string().describe("観察要素のキー(①〜⑤)"),
      text: z.string().describe("読み取り内容(短文)"),
    }),
  ),
  axes: z.array(
    z.object({
      key: z.string().describe("軸キー(axis1, axis2)"),
      score: z.number().int().min(1).max(5),
      elements: z.array(
        z.object({
          key: z.string().describe("要素キー(S1..S4, K1..K4)"),
          mark: MarkSchema,
          reason: z.string().describe("根拠: 一言(15〜40字)"),
        }),
      ),
      note: z.string().describe("補足2〜3行"),
    }),
  ),
  overall: z.object({
    score: z.number().int().min(1).max(5),
    label: z.string().describe("判定ラベル(手法の固定5種から)"),
    rows: z
      .array(z.object({ key: z.string(), value: z.string() }))
      .describe("判定根拠表の行。出力規約で指定されたキーを全て、その順で含める(mainCause: 総合点を縛った1要素を15〜40字で)"),
  }),
  improvements: z
    .array(z.object({ weakness: z.string(), trigger: z.string() }))
    .describe("総合3以下のときのみ。△/×要素ごとに1行、最大3行。4以上なら空配列"),
});

export type EvaluationOutput = z.infer<typeof EvaluationOutputSchema>;

/** 旧形式(gate/specialRule/mainCause/step0 固定)で保存された判定も rows として読めるようにする */
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
