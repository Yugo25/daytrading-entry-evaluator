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
  partial?: string; // △の基準(手法が明示している場合)
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
  higherTimeframes: Record<string, string[]>; // { "1m": ["15m","1h"], "5m": ["15m","1h"], "1h": ["4h","D"] }
  observations: ObservationItem[];
  axes: Axis[];
  verdicts: VerdictLabel[];
  specialRules: { key: string; label: string; description: string }[];
  docs: StrategyDoc[];
  /** 総合評価表の行(手法固有)。モデルは overall.rows にこのキーで値を返す。mainCause は必ず含める */
  overallRows: { key: string; label: string; hint: string }[];
  /** 結果Markdownの見出し(省略時 "評価結果") */
  resultTitle?: string;
  /** 数値データ入力欄のプレースホルダ(手法が要求する価格のキー例) */
  numericPlaceholder?: string;
  /** 上位足フィルター行・入力欄のラベル(省略時 "STEP 0") */
  higherTfLabel?: string;
  /** 判定モデルに渡す追加指示(出力形式の固定など) */
  promptNotes?: string;
}
