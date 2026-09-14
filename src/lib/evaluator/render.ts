import type { StrategyDefinition } from "@/strategies/types";
import type { EvaluationOutput } from "./schema";

/** 構造化出力をスキルの出力テンプレートと同一構成のMarkdownに変換する */
export function renderEvaluation(strategy: StrategyDefinition, out: EvaluationOutput): string {
  const lines: string[] = [];
  lines.push("## ライン評価結果");
  lines.push(`方向: ${out.direction}`);
  lines.push("");
  lines.push("### 観察");
  lines.push("| 要素 | 読み取り |");
  lines.push("|---|---|");
  for (const o of strategy.observations) {
    const found = out.observations.find((x) => x.key === o.key);
    lines.push(`| ${o.key} ${o.label} | ${found?.text ?? "—"} |`);
  }
  lines.push("");
  strategy.axes.forEach((axis, i) => {
    const a = out.axes.find((x) => x.key === axis.key);
    lines.push(`### 軸${i + 1}: ${axis.label} — ${a?.score ?? "?"}/5`);
    lines.push("| 要素 | 判定 | 根拠 |");
    lines.push("|---|---|---|");
    for (const el of axis.elements) {
      const e = a?.elements.find((x) => x.key === el.key);
      lines.push(`| ${el.key} ${el.label} | ${e?.mark ?? "—"} | ${e?.reason ?? ""} |`);
    }
    lines.push("");
    if (a?.note) lines.push(a.note, "");
  });
  lines.push(`### 総合評価 — ${out.overall.score}/5(${out.overall.label})`);
  lines.push("| 判定根拠 | 内容 |");
  lines.push("|---|---|");
  lines.push(`| ゲート | ${out.overall.gate} |`);
  lines.push(`| 特則 | ${out.overall.specialRule} |`);
  lines.push(`| 主因 | ${out.overall.mainCause} |`);
  lines.push(`| STEP 0 | ${out.overall.step0} |`);
  if (out.overall.score <= 3 && out.improvements.length) {
    lines.push("");
    lines.push("**改善提案**");
    lines.push("| 弱点 | 改善トリガー |");
    lines.push("|---|---|");
    for (const im of out.improvements) lines.push(`| ${im.weakness} | ${im.trigger} |`);
  }
  return lines.join("\n");
}
