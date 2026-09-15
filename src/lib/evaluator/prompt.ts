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
 * システムプロンプト = 手法ドキュメント(固定・キャッシュ対象) + 出力規約。
 * 手法ドキュメントは判定の物差しであり、ここでは一切書き換えない。
 */
export function buildSystemPrompt(strategy: StrategyDefinition) {
  const docs = readStrategyDocs(strategy);
  const parts: string[] = [];
  parts.push(
    `あなたは「${strategy.name}」のエントリーモデルが手法基準に適合しているかを判定する評価器です。`,
    "以下の手法ドキュメント(スキル本文・参照資料)を唯一の判定基準として用います。基準を勝手に緩めたり厳しくしたりしないでください。",
    "評価は結果論で行わず、ブレイク前の時点で判断できた情報のみに基づきます。",
    strategy.promptNotes ?? "",
    "",
  );
  for (const d of docs) {
    parts.push(`<document name="${d.name}" role="${d.role}">`, d.content, "</document>", "");
  }
  parts.push(
    "## 出力規約",
    "- 出力は指定されたJSONスキーマに厳密に従う。",
    `- observations は次のキーを全て含める: ${strategy.observations.map((o) => o.key).join(", ")}`,
    `- axes は ${strategy.axes.map((a) => `${a.key}(要素: ${a.elements.map((e) => e.key).join(",")})`).join(" / ")} を全て含める。`,
    `- overall.label は次の固定5種から選ぶ: ${strategy.verdicts.map((v) => v.label).join(" / ")}`,
    strategy.axes.length > 1 ? "- 総合点は各軸の低い方を上限とするゲート方式。特則は陽性確認できた場合のみ発動する。" : "- 軸が1つの場合、その軸スコア = 総合点(換算表に従う)。",
    `- overall.rows は次のキーをこの順で全て含める: ${strategy.overallRows.map((r) => `${r.key}(${r.label}: ${r.hint})`).join(" / ")}`,
    "- improvements は総合3以下のときのみ。4以上なら空配列。",
  );
  return parts.join("\n");
}

/**
 * 過去の判定とユーザーの訂正を「校正例」として渡す。
 * 目的は手法基準の変更ではなく、同じ基準に対する読み取り精度(見落とし・過大/過小評価)の補正。
 */
export function buildFewShotBlock(examples: FewShotExample[]) {
  if (!examples.length) return "";
  const lines: string[] = [
    "## 過去の判定に対するユーザー校正(参照例)",
    "以下は過去の判定と、それに対する手法の熟練者による訂正です。",
    "同じ基準を適用したときに起きた見落とし・過大評価・過小評価のパターンとして参照し、今回の判定に同種の誤りが無いか自己点検してください。",
    "訂正はあくまで読み取りの校正であり、手法基準そのものを変更するものではありません。",
    "",
  ];
  for (const ex of examples) {
    const marks = ex.aiOutput.axes
      .map((a) => `${a.key}=${a.score} [${a.elements.map((e) => `${e.key}${e.mark}`).join(" ")}]`)
      .join(" / ");
    lines.push(`<example pair="${ex.pair}" tf="${ex.execTf}" verdict="${ex.agree ? "同意" : "不同意"}">`);
    lines.push(`AI判定: 総合${ex.aiOutput.overall.score} ${ex.aiOutput.overall.label} / ${marks}`);
    lines.push(`主因: ${overallRow(ex.aiOutput, "mainCause")}`);
    if (!ex.agree) {
      if (ex.correctedScore != null) lines.push(`正しい総合点: ${ex.correctedScore}`);
      if (ex.correctedElements && Object.keys(ex.correctedElements).length)
        lines.push(`訂正要素: ${Object.entries(ex.correctedElements).map(([k, v]) => `${k}→${v}`).join(", ")}`);
    }
    lines.push(`ユーザーコメント: ${ex.comment}`);
    lines.push("</example>", "");
  }
  return lines.join("\n");
}
