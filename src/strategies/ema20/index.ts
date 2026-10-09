import type { StrategyDefinition } from "../types";

export const ema20: StrategyDefinition = {
  id: "ema20",
  name: "20EMA Strategy",
  shortName: "20EMA",
  description:
    "Wave 1 breaks the old trend's structure → Wave 2 makes the first 20EMA touch → capture Wave 3 with the TP at an unreached high/low left by the old trend. Judges 5 items — waves on the left, structure break, origin held, Wave 2 confirmed, TP reference remains — by naming prices. The higher timeframe is not scored.",
  enabled: true,
  execTimeframes: ["1m", "5m", "1h"],
  higherTimeframes: { "1m": ["15m", "1h"], "5m": ["15m", "1h"], "1h": ["4h", "D"] },
  resultTitle: "20EMA Strategy Entry Evaluation",
  higherTfLabel: "Higher TF",
  numericPlaceholder: '{"wave1_start": 2350.0, "wave1_extreme": 2381.5, "pullback_extreme": 2363.2, "tp_ref": 2396.0, "trigger": 2367.4, "entry": 2368.0, "sl": 2360.0, "tp": 2396.0}',
  observations: [
    { key: "①", label: "Cross", hint: "Type (GC/DC), direction and location of the 20/200EMA cross. Whether the touch marker is the first after the cross" },
    { key: "②", label: "Wave 1", hint: "Prices and size of the origin and extreme. Which high/low of the old trend it broke with a candle body" },
    { key: "③", label: "Reversal waves / TP reference", hint: "High/low structure of the old trend on the left. Whether the TP reference (gray line) remains unreached" },
    { key: "④", label: "Corrective wave", hint: "Pullback extreme. Whether it went beyond the Wave 1 origin. Whether the 20EMA was touched" },
    { key: "⑤", label: "Trigger", hint: "Price of the touch candle's high/low (gray line). Position of the entry/SL/TP box" },
  ],
  axes: [
    {
      key: "axis1",
      label: "Judgment",
      subtitle: "Whether the waves formed in the right order (5 items)",
      elements: [
        { key: "W1", label: "Waves on the left", core: true, pass: "The old trend's high/low structure can be named by price", partial: "There is a structure but prices cannot be fully identified", fail: "The old trend's structure cannot be read (→ overall 1)" },
        { key: "W2", label: "Structure break", core: true, pass: "Wave 1 broke the old structure's swing low/high with a candle body", partial: "Wick-only break / the broken level cannot be identified", fail: "Did not break (→ overall 1)" },
        { key: "W3", label: "Origin held", core: true, pass: "The pullback extreme has not gone beyond the Wave 1 origin", partial: "Hard to tell, at roughly the same price as the origin", fail: "Went beyond the origin (→ overall 1)" },
        { key: "W4", label: "Wave 2 confirmed", core: false, pass: "Actual touch of the 20EMA, and the first after the cross", partial: "Touch not reached / near contact, hard to tell", fail: "Second or later touch (if only W4 is ×, overall 2 = wait)" },
        { key: "W5", label: "TP reference remains", core: true, pass: "An unreached high/low within the reversal waves matches the gray line", partial: "There is a TP line but its position within the waves is ambiguous", fail: "No unreached reference remains (→ overall 1)" },
      ],
    },
  ],
  verdicts: [
    { score: 5, label: "Qualified (Exemplary)", meaning: "Structurally complete. Execute as usual" },
    { score: 4, label: "Qualified (Standard)", meaning: "Valid. Execute after confirming the △ items" },
    { score: 3, label: "Caution", meaning: "Multiple insufficient confirmations. Pin down the prices and re-evaluate" },
    { score: 2, label: "Wait", meaning: "Touch not formed. Wait for it and re-evaluate" },
    { score: 1, label: "Skip", meaning: "The structure does not hold. Execution cannot save it" },
  ],
  specialRules: [
    { key: "immediateSkip", label: "Immediate skip", description: "Higher-TF and execution-TF directions mismatch, or any of W1/W2/W3/W5 is × → overall 1" },
  ],
  overallRows: [
    { key: "immediateSkip", label: "Immediate skip", hint: "None / if it applies, state the condition → overall 1" },
    { key: "higherTf", label: "Higher TF", hint: "Direction match/mismatch. Note that it is not scored" },
    { key: "rr", label: "RR", hint: "Expected RRR from entry, SL and TP reference ≈ 1:X.X (both if half/full take-profit)" },
    { key: "mainCause", label: "Main cause", hint: "The element that determined the score, in one line" },
    { key: "nextAction", label: "Next action", hint: "Wait for execution / price to confirm / skip, in one line" },
  ],
  docs: [{ name: "Evaluation skill (ema20-entry-eval)", path: "SKILL.md", role: "skill" }],
  promptNotes: [
    "This skill outputs the 5 judgment items (W1–W5) as a single axis (axis1), and puts the overall score determined by the conversion table into both axis1.score and overall.score. Do not bring items from the exclusion table into scoring.",
    "This evaluator cannot hold a dialogue, so it cannot \"ask back for a price.\" If the Wave 1 origin, Wave 1 extreme or pullback extreme is not in the user's numeric data (JSON) or notes, and the visual estimate is within the error range of a judgment boundary, mark that item △ and state the \"price to confirm\" in rows.nextAction to prompt a re-evaluation. Do not assign × based on a guessed value.",
    "The higher-timeframe direction and AOI are not scored. If a higher-timeframe image is attached, record only direction match/mismatch in rows.higherTf (a mismatch is an immediate-skip condition). If there is none, write \"No image; not scored.\"",
    "Do not score in hindsight.",
  ].join(" "),
};
