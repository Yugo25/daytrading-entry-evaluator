// Common interface for strategy plugins.
// The evaluator, UI and journal all work off this definition alone.

export type Mark = "○" | "△" | "×";

export interface ObservationItem {
  key: string; // "①"
  label: string; // "Impulse wave"
  hint: string; // what to extract
}

export interface CriterionElement {
  key: string; // "S1"
  label: string; // "Wave rhythm"
  core: boolean; // core element? (× caps the axis score at 2)
  pass: string; // criterion for ○
  fail: string; // typical ×
  partial?: string; // criterion for △ (when the strategy defines one explicitly)
}

export interface Axis {
  key: string; // "axis1"
  label: string; // "Swing Clarity"
  subtitle: string; // "Quality of the wave structure"
  elements: CriterionElement[];
}

export interface VerdictLabel {
  score: 1 | 2 | 3 | 4 | 5;
  label: string; // "Qualified (Exemplary)"
  meaning: string;
}

export interface StrategyDoc {
  name: string; // display name
  path: string; // relative path from strategies/<id>/
  role: "skill" | "reference";
}

export interface StrategyDefinition {
  id: string; // "ema200"
  name: string; // "200EMA Strategy"
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
  /** Rows of the overall evaluation table (strategy-specific). The model returns values under these keys in overall.rows. Must include mainCause */
  overallRows: { key: string; label: string; hint: string }[];
  /** Heading of the result Markdown (defaults to "Evaluation Result") */
  resultTitle?: string;
  /** Placeholder for the numeric data input (example price keys the strategy asks for) */
  numericPlaceholder?: string;
  /** Label for the higher-timeframe filter row / input (defaults to "STEP 0") */
  higherTfLabel?: string;
  /** Extra instructions passed to the evaluation model (e.g. pinning the output format) */
  promptNotes?: string;
}
