import type { StrategyDefinition } from "../types";

// 20EMA手法。基準ドキュメント投入後に observations/axes/docs を埋めて enabled: true にする。
export const ema20: StrategyDefinition = {
  id: "ema20",
  name: "20EMA手法",
  shortName: "20EMA",
  description: "(準備中) 手法ドキュメントと判定スキルの投入待ち。",
  enabled: false,
  execTimeframes: ["5m"],
  higherTimeframes: { "5m": ["30m", "1h"] },
  observations: [],
  axes: [],
  verdicts: [],
  specialRules: [],
  docs: [],
};
