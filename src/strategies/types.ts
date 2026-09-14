// 手法(ストラテジー)プラグインの共通インターフェース。
// 判定器・UI・ジャーナルはすべてこの定義だけを見て動く。

export type Mark = "○" | "△" | "×";

export interface ObservationItem {
  key: string; // "①"
  label: string; // "推進波"
  hint: string; // 抽出する内容
}

export interface CriterionElement {
  key: string; // "S1"
  label: string; // "波動リズム"
  core: boolean; // 中核要素か(×で軸スコア上限2)
  pass: string; // ○の基準
  fail: string; // ×の典型
}

export interface Axis {
  key: string; // "axis1"
  label: string; // "スイング明確性"
  subtitle: string; // "波動構造の質"
  elements: CriterionElement[];
}

export interface VerdictLabel {
  score: 1 | 2 | 3 | 4 | 5;
  label: string; // "適格(模範級)"
  meaning: string;
}

export interface StrategyDoc {
  name: string; // 表示名
  path: string; // strategies/<id>/... からの相対パス
  role: "skill" | "reference";
}

export interface StrategyDefinition {
  id: string; // "ema200"
  name: string; // "200EMA手法"
  shortName: string; // "200EMA"
  description: string;
  enabled: boolean;
  execTimeframes: string[]; // ["5m", "1h"]
  higherTimeframes: Record<string, string[]>; // { "5m": ["30m","1h"], "1h": ["4h","D"] }
  observations: ObservationItem[];
  axes: Axis[];
  verdicts: VerdictLabel[];
  specialRules: { key: string; label: string; description: string }[];
  docs: StrategyDoc[];
  /** 判定モデルに渡す追加指示(出力形式の固定など) */
  promptNotes?: string;
}
