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
    gate: z.string().describe("例: min(軸1 4, 軸2 3)= 3"),
    specialRule: z.string().describe("特則の該当/非該当と根拠"),
    mainCause: z.string().describe("総合点を縛った1要素を15〜40字で"),
    step0: z.string().describe("上位足フィルターの扱い(画像外/参考値)"),
  }),
  improvements: z
    .array(z.object({ weakness: z.string(), trigger: z.string() }))
    .describe("総合3以下のときのみ。△/×要素ごとに1行、最大3行。4以上なら空配列"),
});

export type EvaluationOutput = z.infer<typeof EvaluationOutputSchema>;
