import type { StrategyDefinition } from "../types";

export const ema200: StrategyDefinition = {
  id: "ema200",
  name: "200EMA Strategy",
  shortName: "200EMA",
  description:
    "Fix the directional bias with the 20/200EMA cross, then enter on a candle-body break of the descending/ascending line that connects the swing highs/lows of the corrective wave after a 200EMA touch. The higher-timeframe 200EMA slope is the STEP 0 filter.",
  enabled: true,
  execTimeframes: ["1m", "5m", "1h"],
  higherTimeframes: { "1m": ["15m", "1h"], "5m": ["15m", "1h"], "1h": ["4h", "D"] },
  resultTitle: "Line Evaluation Result",
  numericPlaceholder: '{"A": 1.9930, "B": 1.9905, "E": 1.9910, "X": 1.99194, "sl": 1.9900, "tp": 1.9990}',
  observations: [
    { key: "①", label: "Impulse wave", hint: "Direction / duration / price range / presence of an EMA cross (= basis for the N calculation and scale comparison)" },
    { key: "②", label: "Corrective wave", hint: "Origin (end pivot of the impulse wave) / duration / retracement depth / whether it reached the 200EMA" },
    { key: "③", label: "Pivots", hint: "Swing highs/lows recognized within the corrective wave (criterion: a pullback/bounce of at least 30% of the correction range)" },
    { key: "④", label: "Line", hint: "Location of the origin / number of pivots passed through / number of price reactions (touch → bounce)" },
    {
      key: "⑤",
      label: "EMA relationship",
      hint: "Slope of the execution-TF 200EMA / location of touch markers / squeeze between line and EMA (confirmation requirements) / candles in the contact zone / quality of the 200EMA reaction (bounce, intermediate, clinging, undetermined)",
    },
  ],
  axes: [
    {
      key: "axis1",
      label: "Swing Clarity",
      subtitle: "Quality of the wave structure",
      elements: [
        { key: "S1", label: "Wave rhythm", core: true, pass: "The corrective wave forms clear waves with pullbacks/bounces", fail: "Slow grind down/up, or a range" },
        { key: "S2", label: "Pivot reaction", core: true, pass: "Connects 2 or more pivots that have reacted", fail: "Price never reacted; effectively 1 pivot" },
        { key: "S3", label: "Reversal structure", core: false, pass: "Forms a double top/bottom or head and shoulders", fail: "No structure can be recognized" },
        { key: "S4", label: "Uniqueness", core: false, pass: "Almost no other equally valid line can be drawn", fail: "Three equivalent lines can be drawn" },
      ],
    },
    {
      key: "axis2",
      label: "Angle & Scale Fit",
      subtitle: "Whether the line's scale matches the scale of the targeted move",
      elements: [
        { key: "K1", label: "Origin match", core: true, pass: "Origin is at the corrective wave's origin and covers the whole correction", fail: "Captures only the accelerating sub-wave at the tail" },
        { key: "K2", label: "Relative slope", core: true, pass: "Clearly gentler than the preceding impulse wave", fail: "As steep as or steeper than the impulse" },
        { key: "K3", label: "Sufficient scale", core: false, pass: "Enough time/candles to contain multiple swings; pullback does not exceed the impulse origin", fail: "Tiny line / pullback turned into a trend negation" },
        { key: "K4", label: "Break location", core: false, pass: "Retracement ratio r ≤ 0.33", fail: "r > 0.50 (late break far from the EMA)" },
      ],
    },
  ],
  verdicts: [
    { score: 5, label: "Qualified (Exemplary)", meaning: "Equivalent to the model examples. Executable if STEP 0 has been passed" },
    { score: 4, label: "Qualified (Standard)", meaning: "A valid line. Execute with normal position sizing" },
    { score: 3, label: "Caution", meaning: "The shape holds but has weaknesses. Additional confirmation recommended" },
    { score: 2, label: "Skip Recommended", meaning: "Effectively meets the strategy's skip conditions. Do not enter" },
    { score: 1, label: "Skip (Clear Trap)", meaning: "Build-up / squeeze / forced line" },
  ],
  specialRules: [
    { key: "squeeze", label: "Squeeze", description: "Only when 3+ candles of volatility contraction inside the line–200EMA converging wedge, with alternating touches of both boundaries, are positively confirmed → overall capped at 2" },
    { key: "sticking", label: "Clinging to EMA", description: "Only when c≥3 or a≤0.15 is positively confirmed with a contact zone of 3+ candles → overall capped at 2" },
  ],
  overallRows: [
    { key: "gate", label: "Gate", hint: "e.g. min(Axis 1 4, Axis 2 3) = 3" },
    { key: "specialRule", label: "Special rule", hint: "Whether squeeze/clinging to EMA applies, and why" },
    { key: "mainCause", label: "Main cause", hint: "The one element that capped the overall score, in 15–40 characters" },
    { key: "step0", label: "STEP 0", hint: "How the higher-timeframe filter was handled (outside the image / reference values)" },
  ],
  docs: [
    { name: "Evaluation skill (trendline-eval)", path: "SKILL.md", role: "skill" },
    { name: "Strategy overview", path: "references/strategy-overview.md", role: "reference" },
    { name: "Strategy key points (scope needed for line evaluation)", path: "references/methodology.md", role: "reference" },
    { name: "Model example analysis & calibration anchors", path: "references/ideal-examples.md", role: "reference" },
  ],
  promptNotes:
    "This skill evaluates only the line quality of STEP 3. If STEP 0 (higher-timeframe slope) cannot be read from the image, state that it is outside the scope of evaluation. Do not score in hindsight.",
};
