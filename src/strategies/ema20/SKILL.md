---
name: ema20-entry-eval
description: A skill that objectively and mechanically evaluates whether an entry is valid under the 20EMA strategy, from a single execution-timeframe chart image. Always use this skill when the user uploads an execution-timeframe chart image (1m/5m/1h, e.g. XAUUSD or USDJPY) and asks things like "evaluate this 20EMA entry", "does this meet the 20EMA strategy criteria", "judge the Wave 1 / corrective wave / touch", or "check this against the 20EMA strategy"; when the user names a Notion trade-log page and asks for a 20EMA strategy evaluation; or when the user asks for a pre-entry chart check, a trade review, or a pullback judgment. Also use it when a chart showing the 20/200EMA, GC/DC markers, a 20EMA touch and an entry box is presented for evaluation. This is separate from the descending/ascending trendline evaluation of the 200EMA strategy; it evaluates the validity of a strategy that targets the first pullback after a 20/200EMA cross (= Elliott Wave 3).
---

# 20EMA Strategy Entry Evaluation Skill

## Purpose of this skill

Determine whether a 20EMA strategy entry is "a qualified setup that meets the criteria" by mechanically scoring a single execution-timeframe chart with 5 observation elements and 5 judgment items, and output an overall verdict out of 5. Always output in the same format, and exclude hindsight and impression-based evaluation.

## The essence of the strategy

This strategy captures **"the move toward an unreached target left behind by a broken structure."** Its edge comes from the order in which the waves form.

1. **There are waves on the left** — the old trend has left a structure of highs and lows
2. **A Wave 1 that negates that structure appears** — it breaks the old trend's swing low/swing high with a candle body
3. **A Wave 2 (correction) against Wave 1 follows** — confirmed by a 20EMA touch
4. **Capture Wave 3** — the TP is placed at an unreached high/low left behind by the old trend

The only thing to judge is whether this chain holds. When you are eager to enter, it is easy to gloss over each stage of the chain as "roughly there." **Answer every item by naming a price. An item for which you cannot name a price is never marked ○.**

## About the execution timeframe

- The default execution timeframe is **5m**. However, **entries are also made on 1m and 1h**.
- When the execution timeframe is 1m or 1h, apply the criteria as is. No note about a timeframe mismatch is needed.
- **The input is the execution-timeframe chart image only.** The higher-timeframe direction and the quality of the AOI cannot be judged from the image, so they are not scored.

## Conventions for reading the input chart

Read the execution-timeframe chart image (TradingView) given by the user according to the following conventions:

- **Green candles = bullish, black candles = bearish**
- **Light blue = 20EMA, dark blue = 200EMA**
- **Green vertical line = where the latest golden cross (GC) occurred; orange/red vertical line = where a dead cross (DC) occurred**
- **Green marker = the first price touch of the 20EMA after a GC; orange/red marker = the first touch after a DC** (= the marker for the first touch after the cross; corresponds to W4)
- **Gray lines = exactly two.** ① The high/low used as the TP reference (the swing low/swing high left behind by the old trend on the left), ② the high/low of the touch candle (= the reference price for the entry trigger)
- **Gray box = the higher-timeframe AOI.** Reference information only; not used for scoring
- **Green/red box = the entry.** The boundary is the entry price; **the red side is toward the SL and the green side toward the TP.** For a long, red is below and green above; for a short, red is above and green below

Direction: GC (green) + green marker = long assumed; DC (orange/red) + orange/red marker = short assumed. Check that this is consistent with which side of the entry box is red/green.

## Price-reading precision rules (important)

The right-axis scale of a chart image is coarse, and visual price estimates retain **an error of roughly ±3–4 dollars**. Therefore:

- **The two gray-line prices (TP reference and trigger) and the entry/SL/TP of the entry box can be determined from the chart.** These may be read.
- **The three prices — Wave 1 origin, Wave 1 extreme, and the pullback extreme — can flip the verdict if estimated visually.** If the user provides the numbers, always use them.
- If the user has not provided the numbers and the visual estimate is within the error range of a judgment boundary, **do not assert based on a guess; ask back for one of those prices.** Do not assign a score while it remains ambiguous.
- Standard prompt for input: "Please give me the Wave 1 origin / Wave 1 extreme / pullback extreme as numbers."

## Observation phase (fixed 5 elements)

Before scoring, always extract and put into words the following.

| Element | What to extract |
|---|---|
| ① Cross | Type (GC/DC), direction and location of the 20/200EMA cross. Whether the touch marker is the **first after the cross** |
| ② Wave 1 | Prices and size of the origin and the extreme. Which high/low of the old trend it broke with a candle body |
| ③ Reversal waves / TP reference | The high/low structure of the old trend on the left. Whether the TP reference (gray line) remains **unreached** |
| ④ Corrective wave | The pullback extreme. Whether it has gone beyond the Wave 1 origin. Whether the 20EMA was touched |
| ⑤ Trigger | The price of the touch candle's high/low (gray line). The positions of the entry/SL/TP box |

## Judgment phase (fixed 5 items)

Mark each item **○ (clearly met) / △ (insufficiently confirmed) / × (not met)**.

| # | Item | ○ criterion | △ criterion | × criterion |
|---|---|---|---|---|
| W1 | Waves on the left | The old trend's high/low structure can be named by price | There is a structure but prices cannot be fully identified | The old trend's structure cannot be read |
| W2 | Structure break | Wave 1 broke the old structure's swing low/swing high with a **candle body** | Wick-only break / the broken level cannot be identified | Did not break |
| W3 | Origin held | The pullback extreme **has not gone beyond the Wave 1 origin** | Hard to tell, at roughly the same price as the origin | Went beyond the origin |
| W4 | Wave 2 confirmed | **Actual touch** of the 20EMA, and the **first** after the cross | Touch not reached / near contact, hard to tell | Second or later touch |
| W5 | TP reference remains | There is an **unreached** high/low within the reversal waves and it matches the gray line | There is a TP line but its position within the waves is ambiguous | No unreached reference remains |

### Items not scored (explicitly excluded)

The following are not used for judgment. They have been excluded with reasons; do not bring them back.

| Excluded item | Reason |
|---|---|
| "Completion" of Wave 1 | Since the furthest point at evaluation time is called the extreme, it is always true by definition. It can never be × |
| Depth of the pullback / reaching the 200EMA | If the origin has not been exceeded, the structure is alive. Depth itself is irrelevant |
| Absolute distance to the SL | Absorbed by lot sizing, so it is not a risk |
| Time taken by the correction / sideways action | What matters is that the origin holds, not time or shape |
| Number of times price crosses the 20EMA | The touch candle is uniquely defined as "the first candle to touch after the cross," so the judgment does not waver |
| Trigger line (ascending/descending line) | An element of the 200EMA strategy; it does not exist in the 20EMA strategy |
| Confirmed body break of the touch candle's high/low | Most evaluation requests come before the break. It is an execution condition, not a validity judgment |
| Immediate break on the next candle | Excluded on the user's side as an operating rule (a break on the candle right after the touch candle is invalid) |

### Conversion table

| Overall | Condition |
|---|---|
| 5 | All 5 items ○ |
| 4 | Four ○ + one △ (no ×) |
| 3 | Two or more △ (no ×) |
| 2 | Only W4 is × (touch not formed = wait) |
| 1 | Any of W1/W2/W3/W5 is × |

Judge from the top and take the first row that applies. When in doubt, err toward the lower score.

### Immediate-skip conditions (outside scoring; leads directly to overall 1)

- The higher-timeframe and execution-timeframe directions do not match
- Any of W1/W2/W3/W5 is × (automatically 1 by the conversion table)

### Handling of RR

Not included in scoring. Estimate the expected RRR from the entry/SL/TP box and the TP reference line, and add it to the overall evaluation table. If there are two stages (half and full take-profit), state both.

## Overall verdict labels

| Overall | Label | Meaning |
|---|---|---|
| 5 | Qualified (Exemplary) | Structurally complete. Can be executed as usual |
| 4 | Qualified (Standard) | Valid. Execute after confirming the △ items |
| 3 | Caution | Multiple insufficient confirmations. Pin down the prices and re-evaluate |
| 2 | Wait | Touch not formed. Wait for it and re-evaluate |
| 1 | Skip | The structure does not hold. Execution cannot save it |

## Output format (strict; no deviation)

**Whether the output goes to chat or to Notion, always use exactly the same structure, headings and table layout as the template below.**

Required rules:
1. **Observations are always a 5-row table** (①–⑤). Do not replace it with bullet points.
2. **Judgment is always a 5-row table** (W1–W5). The heading must include "— X/5 (label)".
3. Place **2–3 lines of supplementary notes** (prose) right after the judgment table.
4. The "Named price / basis" column is a word to a short sentence **that includes a price whenever possible** (about 15–40 characters as a guide).
5. End with the **fixed 5-row basis table** (Immediate skip / Higher TF / RR / Main cause / Next action). **Only when the overall is 3 or lower**, place an **improvements table** right after it. Do not output it for 4 or higher.
6. Write the direction (long/short, GC/DC, type of first touch) in the first line.
7. Do not write prose paragraphs in the overall evaluation.
8. When writing to Notion, the only thing you may add is a single evaluation-date stamp line at the end.

```
## 20EMA Strategy Entry Evaluation
Direction: (Long/Short, GC/DC, first touch: green marker/orange marker)

### Observations
| Element | Reading |
|---|---|
| ① Cross | (type GC/DC, direction, location, whether it is the first touch) |
| ② Wave 1 | (origin/extreme prices, size, level broken) |
| ③ Reversal waves / TP reference | (old trend structure, whether the TP reference remains unreached) |
| ④ Corrective wave | (pullback extreme, comparison with origin, 20EMA touch) |
| ⑤ Trigger | (touch candle high/low price, entry/SL/TP) |

### Judgment — X/5 (label)
| # | Item | Mark | Named price / basis |
|---|---|---|---|
| W1 | Waves on the left | ○/△/× | (one line including a price) |
| W2 | Structure break | ○/△/× | (one line including a price) |
| W3 | Origin held | ○/△/× | (one line including a price) |
| W4 | Wave 2 confirmed | ○/△/× | (one line) |
| W5 | TP reference remains | ○/△/× | (one line including a price) |

(2–3 lines of supplementary notes)

| Basis | Content |
|---|---|
| Immediate skip | None (state the condition only if it applies → overall 1) |
| Higher TF | (direction match/mismatch; note that it is not scored) |
| RR | Expected RRR from entry, SL and TP reference ≈ 1:X.X (both if half/full take-profit) |
| Main cause | The element that determined the score, in one line |
| Next action | (wait for execution / price to confirm / skip, in one line) |

**Improvements** (only when overall is 3 or lower)
| Weakness | Improvement trigger |
|---|---|
| (element that was △/× and one line) | (how to wait so that it becomes ○, one line) |
```

## Notes for evaluation (ensuring objectivity)

- **Do not score in hindsight.** Even if the price action after the break appears in the image, the evaluation is based on "whether the criteria were met at that moment." A winning trade with a bad shape can be rated low, and a losing trade with a correct shape can be rated high.
- **Do not move the score on impressions.** "Somehow weak" or "momentum is dead" are not judgment items. Apply only the criteria of the 5 items above.
- **Do not assert from visual estimates.** Following the precision rules, when the dividing line of a judgment falls within the error range, ask back for the price. Do not assign × based on a guessed value.
- **Do not add items.** Do not revive items in the exclusion table "just in case." The more scoring items you add, the more subjectivity creeps in, effectively building an impression out of the number of ○.
- State explicitly that higher-timeframe information is not scored.

## Retrieving chart images from a Notion page

When the user specifies only a page name and has not attached an image in the chat:

1. Fetch the page with the Notion fetch tool. Under the "## Execution TF" section there is a signed image URL (`prod-files-secure.s3.us-west-2.amazonaws.com`, valid for 1 hour)
2. Download it with `curl -s -o /home/claude/chart_exec.png "<image URL>"` and check with `file` that it is a PNG/JPEG
3. Open the image with the view tool and evaluate
4. Use the image under "## Higher TF" only for reference mentions

On failure: if the download fails, re-fetch the page to get a new URL. If it fails because of the allowlist, guide the user to add `prod-files-secure.s3.us-west-2.amazonaws.com`, and in the meantime ask them to upload the image.

## Writing the evaluation result to Notion

When the user specifies a destination page (e.g. "1. USDJPY inside 6/14-6/19"):

1. Find the page following the hierarchy Trading Journal → week range name → currency pair name
2. Write under the "AI Evaluation" heading. If there is none, create it at the end of the page
3. The content must have **exactly the same structure as the output format, word for word**. Do not restructure, summarize, or add sections. Only a single evaluation-date stamp line may be added at the end
4. Also show the identical evaluation result in the chat, with a short note that writing is complete

If the page cannot be found or there are multiple candidates, do not write; confirm the candidates first.
