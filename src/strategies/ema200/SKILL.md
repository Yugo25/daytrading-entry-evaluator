---
name: trendline-eval
description: A skill that evaluates the validity of a descending/ascending line (trendline) in the 200EMA strategy. Always use this skill when the user uploads a 1m, 5m or 1h chart image (e.g. XAUUSD or USDCAD) and asks things like "evaluate this line", "does this meet the entry criteria", "judge this ascending/descending line", or "check this against the 200EMA strategy"; when the user names a Notion trade-log page and asks for an evaluation; or when the user asks for a pre-entry chart check, a trade review, or feedback on how a line was drawn. Also use it when a chart image has a trendline drawn on it and an evaluation or judgment is requested.
---

# 200EMA Strategy Descending/Ascending Line Evaluation Skill

## Purpose of this skill

In STEP 3 of the 200EMA strategy (entry on a Dow-theory line break), structurally evaluate whether the drawn descending/ascending line is "a valid line worth entering on," using a fixed set of 5 observation elements and 8 evaluation elements (4 elements per axis × 2 axes), and output an overall verdict.

The core of the strategy that the evaluation assumes:
- A genuine corrective wave forms **clear swing highs and lows** as counter-trend traders enter and exit. A break of the line connecting those swings = the moment the counter-trend traders give up = the resumption of the impulse wave. That is exactly why the break means something.
- A slow grind down / slow grind up or a range is not a correction but **accumulation (build-up)**, and its eventual resolution tends to come on the 200EMA-break side (= the SL side).
- A steep line captures **only a small sub-wave at the tail end**, not the whole correction. Its break is merely the end of one micro leg; the larger corrective structure tends to continue and move toward the SL.
- How "easy the line is to draw" is itself diagnostic. The break of a forced line is noise.

For the background of the strategy as a whole (the STEP 0 slope filter, etc.) refer to `references/methodology.md`, and for the characteristics of the model examples refer to `references/ideal-examples.md`, as needed.

## About the execution timeframe

- The default execution timeframe is **5m**. However, **entries are also made on 1m and 1h**.
- When the execution timeframe is 1h, **apply this skill's criteria (5 observation elements, 8 evaluation elements, scoring tables) to 1h as is**. No note about a timeframe mismatch is needed.
- The reference timeframes for STEP 0 (higher-timeframe filter) are 15m and 1h for 1m/5m entries, and **4h and daily for 1h entries**. Use this mapping when mentioning them.

## Conventions for reading the input chart

The chart images (TradingView) the user provides for evaluation use a different color scheme from the model images. Read them according to the following conventions:

- **Green candles = bullish, black candles = bearish**
- **Dark blue = 200EMA, light blue = 20EMA**
- **Black diagonal straight line = the descending/ascending line** (the subject of evaluation)
- **Green/red box**: the boundary is the entry price, the red side is the SL and the green side is the TP (same as the model images)
- **Green vertical line = where a golden cross occurred; orange vertical line = where a dead cross occurred** (the marker that fixes the directional bias in STEP 1)
- **Green circle = the first 20EMA touch and the first 200EMA touch after a golden cross**. Orange circle = the same first touches after a dead cross (the marker for STEP 2)
- **Gray horizontal lines / wide boxes = higher-timeframe AOI**. Irrelevant to the execution-timeframe line evaluation; ignore them
- The timeframe panel at the top right of the screen (arrows for 15m/1h/4h/D, etc.) shows **the golden/dead cross state of each timeframe**. Note that this is "directional bias" information and is different from the "200EMA slope" that STEP 0 requires. It may be mentioned as reference information but is not included in scoring

## Evaluation workflow

### Observation phase (fixed 5 elements)

Before scoring, always extract and put into words the following 5 elements. Both analysis and output are always done in terms of these 5 elements.

| Element | What to extract |
|---|---|
| ① Impulse wave | Direction / duration / price range / presence of an EMA cross (= the basis for the N calculation and scale comparison) |
| ② Corrective wave | Origin (the end pivot of the impulse wave) / duration / retracement depth / whether it reached the 200EMA |
| ③ Pivots | List of swing highs/lows recognized within the corrective wave (recognition criterion: accompanied by a pullback/bounce of at least 30% of the correction range) |
| ④ Line | Location of the origin / number of pivots it passes through / number of price reactions (touch → bounce) |
| ⑤ EMA relationship | Slope of the execution-timeframe 200EMA / location of the touch markers (circles) / squeeze between the line and the EMA (whether the confirmation requirements are met) / number of candles in the contact zone / **quality of the 200EMA reaction (bounce, intermediate, clinging, undetermined)** |

### Scoring phase

Each axis is judged on 4 fixed elements. Mark each element **○ (clearly met) / △ (partial / insufficiently confirmed) / × (not met)**, and determine the axis score with the conversion table.

## Axis 1: Swing clarity (quality of the wave structure)

The axis that judges "is this pullback a genuine correction, or a build-up?"

| Key | Element | ○ criterion | Typical × |
|---|---|---|---|
| S1 | Wave rhythm | The corrective wave forms clear waves with pullbacks/bounces (not a grind or a range) | A slow grind down/up with candles continually overlapping, or a range |
| S2 | Pivot reaction | The line connects 2 or more pivots that have reacted (flawless if there is a reaction at a 3rd point) | Price has never reacted; effectively 1 pivot |
| S3 | Reversal structure | The pivots form a named reversal structure (double top/bottom, head and shoulders) | No structure can be recognized |
| S4 | Uniqueness | Almost no other equally valid line can be drawn | Three equivalent lines can be drawn; tempted to draw through the middle of a cluster |

**The core elements are S1 and S2.** If either is ×, Axis 1 is automatically 2 or lower.

## Axis 2: Angle and scale fit

The axis that judges "does the scale of this line match the scale of the move we are aiming for?"

| Key | Element | ○ criterion | Typical × |
|---|---|---|---|
| K1 | Origin match (wholeness) | The line's origin is at the origin of the corrective wave (the end pivot of the impulse wave) and it covers the **whole** correction | Starts in the middle or at the tail of the correction and captures only the final accelerating sub-wave |
| K2 | Relative slope | The line's slope is **clearly gentler** than the slope of the preceding impulse wave (corrections are slower than impulses) | As steep as or steeper than the impulse (scale mismatch, or suspicion of an impulse in the opposite direction) |
| K3 | Sufficient scale | The correction has developed over enough time / candles to contain multiple swings, **and the pullback has not gone beyond the origin of the impulse wave** (not a trend negation) | A tiny line containing only a few candles. **Or the pullback clearly exceeds the origin of the impulse wave (higher high/lower low) and the correction has turned into a trend negation** |
| K4 | Break location | **Retracement ratio r ≤ 0.33** (break in the lower 1/3 of the correction range = near the EMA bounce) | **r > 0.50** (break in the upper half of the correction = buying the pullback rather than the bounce; far from the EMA, SL far away) *Judge per "Objective judgment of K4" below |

**The core elements are K1 and K2.** If either is ×, Axis 2 is automatically 2 or lower.

**Important notes**:
- **It is normal for the corrective wave to take longer to form than the impulse wave; do not deduct for it.** Impulses are fast and corrections are slow — if anything, a correction that takes time is a hallmark of a genuine correction. In the model examples too, the correction often takes as long as or longer than the impulse.
- Angle depends on the aspect ratio of the image, so do not judge by absolute angle (XX degrees). **Always judge by relative comparison with the slope of the preceding impulse wave** (K2).
- The essence of "steep" is not speed but **scale mismatch**: the line is based on a sub-wave that is too small rather than on the whole correction (K1 and K2 are two manifestations of the same pathology).

**Do not confuse "retracement depth" with "trend negation" (★ preventing recurrence of misjudgment)**:
- **Retracement depth** is a **descriptive metric** measured as `pullback size ÷ price range of the preceding impulse wave` in %, and **its reference is always "the preceding impulse wave."** Do not write "deep" without stating what it is deep relative to. **A 50–78% retracement is normal** for a correction, and **depth alone is not a deduction**. Just write the % in Observation ②; do not make it × on K3.
- **K3 × = trend negation** is recognized only by the **measurable event** that the pullback **clearly exceeded the origin of the impulse wave (higher high/lower low)**. "Close to the origin" or "deep" is not ×.
- **Reaching the 200EMA is a premise of this strategy (the destination of the pullback) and is not in itself a deduction.** "It reached the EMA = deep/dangerous" is a category error. Measure depth as a % of the impulse wave, separately from whether the EMA was reached. Danger at the EMA is evaluated by the "quality of the reaction (R)" and the "special rule," not by "depth."

### Objective judgment of K4 (break location)

K4 judges "is the break near the 200EMA touch?" not by subjective "near/far" but by **position normalized by the scale of the corrective wave**. The aim is to catch the break = 200EMA bounce near the touch, so that the SL (the final high/low of the correction) is close and the RRR stays within 1:1–1:3. This quantification prevents mistaking "a break within the same corrective structure" for "near the touch" (preventing recurrence of past misjudgments).

**The 4 points to measure (long; invert for short):**

| Key | Meaning |
|---|---|
| A | Origin of the correction (end pivot of the impulse wave = the high, for a long) |
| B | Extreme of the correction (the low of the 200EMA touch = SL anchor, for a long) |
| E | 200EMA value at the time of the break |
| X | Break price (= entry price) |
| R | \|A − B\| = width of the correction range (the normalizing denominator) |

**Primary metric: retracement ratio r** = what fraction of the correction range has already been retraced at the time of the break.
- Long: `r = (X − B) / R`  /  Short: `r = (B − X) / R`

| r | K4 | Meaning |
|---|---|---|
| r ≤ 0.33 | ○ | Break in the lower 1/3 of the correction range. Near the EMA bounce, SL is close (measured on model examples: r≈0.29–0.33) |
| 0.33 < r ≤ 0.50 | △ | Lower half but toward the middle. Somewhat late; RR degrades but is acceptable |
| r > 0.50 | × | Break in the upper half of the correction. Buying the "pullback" rather than the bounce; far from the EMA, SL far away |

**Secondary metric: EMA deviation ratio g** = `\|X − E\| / R`. g ≤ 0.20 reinforces ○; g > 0.40 reinforces ×.

**RR cross-check**: If the RRR with the SL slightly beyond B and the TP at the impulse wave's N-calculation value falls below 1:1, K4 is × regardless of r (the entry is too late and the edge is gone). Even if the RRR is within range, note in the supplement that the higher r is (= later), the more the RR is compressed toward 1:1.

**Boundary handling**: If r is within ±0.05 of a band boundary, decide using the secondary metric g and the RRR. Always judge by this normalized metric rather than the absolute angle (because it does not depend on the image's aspect ratio). A/B/E/X may be approximated from the chart image, but must not contradict the values read in Observations ⑤ and ④.

## Axis score conversion table (common to both axes)

| Axis score | State of elements |
|---|---|
| 5 | All 4 elements ○ |
| 4 | Three ○ + one △ (no ×) |
| 3 | Two ○ + two △ (no ×), **or exactly one × on a non-core element (S3/S4, K3/K4)** (no other ×; stays at 3 regardless of △) |
| 2 | **One × on a core element (S1/S2, K1/K2)** (no other ×) |
| 1 | Two or more ×, or a forced line / a complete range |

Judge from the top and take the first row that applies. Note that the handling of × branches on **which element is ×**:
- **A single × on a core element (S1/S2, K1/K2) → 2** (the foundation is broken, so drop to "skip recommended").
- **A single × on a non-core element (S3/S4, K3/K4) → 3** (only an element that raises quality is missing, so keep it at "caution." Do not drop below 3 even if there are also △).
- **Two or more × → 1** (regardless of core or non-core).

When in doubt, err toward the lower score (because the strategy itself is designed conservatively: "do not enter if even one skip condition applies").

## Overall evaluation

The overall score is **capped at the lower of the two axes** (gate method).

| Overall | Verdict | Meaning |
|---|---|---|
| 5 | Entry Qualified (Exemplary) | Equivalent to the model examples. A shape that may be executed if STEP 0 has been passed |
| 4 | Entry Qualified (Standard) | A valid line. Can be executed with normal position sizing |
| 3 | Caution | The shape holds but has weaknesses. Additional confirmation recommended (wait for a 3rd-point reaction, wait for the reversal structure to complete) |
| 2 | Skip Recommended | Effectively meets the strategy's skip conditions. Do not enter |
| 1 | Skip (Clear Trap) | Build-up / squeeze / forced line. The losing pattern of February–May |

### Principle for invoking the special rule (200EMA warning cap) ★ Most important — preventing recurrence of misjudgment

The special rule is a **hard cap** that limits the overall score to a maximum of 2. A hard cap is handled fundamentally differently from the ○/△/× scoring of the axes:

- **For axis scoring, "when in doubt, go lower" is fine** (conservative design). But **for the special rule, "when in doubt, do not invoke it."** Because it forcibly drops the overall score to 2, invoke it **only when the objective signal is explicitly satisfied (positively confirmed)**.
- **Never invoke it on undetermined impressions such as "-ish," "leaning toward," "converging," or "forming."** Those drop to "Caution (3) / awaiting confirmation," not to the special rule.
- The special rule is "**confirmation that** a bad pattern **is happening**," not "a hunch that it might happen." Write hunches in the Axis 2 / observation supplement, and do not let them cap the score.

**Only when one of the following is confirmed in Observation ⑤ and meets the development requirements below**, cap the overall score at 2 regardless of the axis scores (because it is directly linked to the strategy's "biggest warning point" = a bounce turning into a break).

1. **Squeeze (confirmation requirements)**: **all** of the following are met.
   - The line and the 200EMA are converging (converging wedge), **and**
   - Price has chopped inside that wedge for **3 or more** candles with each candle's range (body + wicks) shrinking (volatility contraction), **and**
   - Price is **alternately touching both boundaries of the wedge (line side and EMA side)** (touching only one side, or merely reaching the apex, does not count).
   - → A stage where these are not all met and it is merely geometrically converging / has merely reached the apex is **"forming = not applicable (monitor)."** The special rule is not invoked.
2. **Clinging to the EMA (build-up)**: Only when **positively confirmed as × = clinging** in "Quality of the 200EMA reaction (R)" below (the contact zone has reached the valid number of candles, and c≥3 or a≤0.15). **Do not invoke it when undetermined (just reached, 1–2 contact candles).**

**Before invoking the special rule, always ask yourself (if not all 3 are YES, it does not apply)**:
- Q1: Is that judgment a "measured objective fact," or a "hunch that it is likely to happen"? → If it is a hunch, it does not apply.
- Q2: Is there data from **3 or more** candles in the contact zone (or inside the wedge)? → If only 1–2 candles, it is unmeasurable = undetermined = not applicable.
- Q3: Have I written "-ish," "leaning toward," "converging," or "forming" in my text? → If so, it is undetermined and not the special rule. Drop to Caution (3).

### Objective judgment of the quality of the 200EMA reaction (R)

Classify how price reacted to the 200EMA: a "bounce that springs away," a "build-up that clings to the EMA," **or undetermined because it has only just arrived and cannot yet be judged**. **A bounce is confirming evidence for the entry; clinging is a precursor of the break turning into a 200EMA break (= toward the SL)**, and the two are distinguished by the character of the price action (model examples: a bounce leaves the EMA with amplitude and forms a double structure / the losing example at the end of April 2025: oscillating back and forth across a flat EMA while contracting).

**Contact zone**: from the first candle in which price reached the 200EMA until the line-break candle.

**Valid number of candles in the contact zone (★ gate)**: Both c and a measure "the behavior of multiple candles relative to the EMA," so if the contact zone is too short, the measurement does not hold. **If the contact zone has fewer than 3 candles (arrival is almost on the last candle, 1–2 touches), c and a are unmeasurable, and R is automatically "undetermined."** In this case, do not classify it as either clinging or bounce (= do not write "clinging-ish" or "bounce-ish"). This is a frequent state in this strategy, where the line break occurs at the same time as the 200EMA touch (because the entry trigger comes before the reaction resolves).

**3 objective signals (measured only when the contact zone has 3 or more candles):**

| Signal | Toward bounce (good) | Toward clinging (dangerous) |
|---|---|---|
| Cross count c (number of sign changes where the close crossed the 200EMA) | c ≤ 1 (reacted on one side and left) | c ≥ 3 (oscillating across the EMA) |
| Departure size a (maximum distance from the EMA within 3–5 candles after the touch ÷ correction range R) | a ≥ 0.30 (sprang away with amplitude) | a ≤ 0.15 (stays right on the EMA) |
| Candle contraction / EMA slope | Clear rejection candle, EMA has a slope | Bodies/wicks contracting, EMA flat |

**Judgment (4 categories):**
- **Undetermined (1–2 contact candles, just arrived)**: c/a are unmeasurable. **Special-rule trigger 2 is not invoked.** State "reaction undetermined (just arrived)" in Observation ⑤, and reflect it in the main cause of the overall evaluation as "reaction undetermined = awaiting confirmation" (per the gate, usually Caution = 3. No hard cap).
- **Bounce (○, confirming evidence)**: contact zone of 3 or more candles and c ≤ 1 and a ≥ 0.30. Reinforces S3 (reversal structure). No penalty.
- **Clinging (×, special rule invoked)**: contact zone of 3 or more candles and (c ≥ 3 or a ≤ 0.15). **Special-rule trigger 2 → overall capped at 2**.
- **Intermediate (△, caution)**: contact zone of 3 or more candles but not confirmed as either bounce or clinging above. No hard cap; state it in the supplement and combine it with other weaknesses.

**Important (handling of early arrival)**: Pushing "undetermined" toward "leaning toward clinging" and invoking the special rule is a mistake (a misjudgment that actually happened with GBPAUD in a past session). Undetermined is an unfavorable factor but is **awaiting confirmation**, not a confirmed trap. Capping at 2 as a trap requires positive confirmation of clinging.

**Note**: Clinging often makes S1 (wave rhythm) × as well, but when the whole correction has swings and **only the final approach** clings to the EMA, S1 cannot catch it. This judgment is a dedicated filter that fills that gap. The boundary is decided by the EMA slope (flat = reinforces clinging).

## Output format (strict; no deviation)

**Whether the evaluation result goes to chat or to Notion, always use exactly the same structure, headings and table layout as the template below.** Changing the format by destination, replacing tables with bullet points, and merging, omitting or reordering sections are all prohibited.

Required rules:
1. **Observations are always a 5-row table** (①–⑤). Replacing it with bullet points or paragraphs with bold labels is prohibited.
2. **Axis 1 and Axis 2 are always 4-row tables each** (S1–S4 / K1–K4). The heading must include the score "— X/5".
3. Place **2–3 lines of supplementary notes** (prose) right after each axis table.
4. The "Reading" and "Basis" columns are a word to a short sentence (about 15–40 characters as a guide). Put long explanations in the supplement.
5. End with "### Overall Evaluation — X/5 (verdict label)" + the **fixed 4-row basis table** (Gate / Special rule / Main cause / STEP 0). **Only when the overall is 3 or lower**, place an **improvements table** (weakness → improvement trigger) right after it. Do not output the improvements section when it is 4 or higher.
   - Choose the verdict label from the fixed 5 in the conversion table (`Qualified (Exemplary)` / `Qualified (Standard)` / `Caution` / `Skip Recommended` / `Skip (Clear Trap)`).
   - Do not write prose paragraphs in the overall evaluation. Verbose content such as comparisons with other pairs, preambles or background explanations is prohibited (fit the necessary point into the "Main cause" column in one line).
   - Improvements are **one row per element that was △/× in scoring** (prioritize the elements that capped the score, max 3 rows). Do not use your own numbering like ①②③ or free-form bullet points.
   - Do not add your own sections under other names such as "Conclusion" or "Skip decision."
6. Write the direction (long/short, line type) in one line right after "## Line Evaluation Result".
7. The only line you may add when writing to Notion is an evaluation-date stamp at the end (e.g. `*Evaluated: YYYY-MM-DD / 200EMA strategy line evaluation*`).

```
## Line Evaluation Result
Direction: (Long/Short, descending/ascending line, cross type)

### Observations
| Element | Reading |
|---|---|
| ① Impulse wave | (direction, duration, price range, cross) |
| ② Corrective wave | (origin, duration, retracement depth, EMA reached) |
| ③ Pivots | (recognized swing highs/lows) |
| ④ Line | (origin, pivots passed through, number of reactions) |
| ⑤ EMA relationship | (slope, touch markers, contact candles, whether squeeze confirmation requirements are met, reaction quality: bounce/intermediate/clinging/undetermined) |

### Axis 1: Swing Clarity — X/5
| Element | Mark | Basis |
|---|---|---|
| S1 Wave rhythm | ○/△/× | (one line) |
| S2 Pivot reaction | ○/△/× | (one line) |
| S3 Reversal structure | ○/△/× | (one line) |
| S4 Uniqueness | ○/△/× | (one line) |

(2–3 lines of supplementary notes)

### Axis 2: Angle & Scale Fit — X/5
| Element | Mark | Basis |
|---|---|---|
| K1 Origin match | ○/△/× | (one line) |
| K2 Relative slope | ○/△/× | (one line) |
| K3 Sufficient scale | ○/△/× | (one line) |
| K4 Break location | ○/△/× | (one line) |

(2–3 lines of supplementary notes)

### Overall Evaluation — X/5 (verdict label)
| Basis | Content |
|---|---|
| Gate | min(Axis 1 X, Axis 2 Y) = Z |
| Special rule | 200EMA warning (squeeze/EMA clinging) not applicable (invoked only on positive confirmation; undetermined or forming is not applicable. Only if it applies, state "applies → cap 2" with the type) |
| Main cause | The element that capped the overall score, in one line (e.g. K4× = late break far from the 200EMA) |
| STEP 0 | Higher-timeframe slope is outside the image / reference only (panel: 15m… 1h… 4h… D…) |

**Improvements** (only when overall is 3 or lower)
| Weakness | Improvement trigger |
|---|---|
| (element that was △/× and one line) | (how to wait / where to draw so that it becomes ○, one line) |
```

**How to write the overall evaluation and improvements (unified format)**:
- Output the overall evaluation as the **fixed 4-row table** above (Gate / Special rule / Main cause / STEP 0), in the same order every time. Do not write prose paragraphs.
  - Gate: only the formula `min(Axis 1 X, Axis 2 Y) = Z`.
  - Special rule: always state whether the squeeze applies or not (append "→ cap 2" only if it applies).
  - Main cause: the **one element** that determined the overall score, in 15–40 characters. Even if there are several, narrow it to the single most constraining one.
  - STEP 0: one line noting that the slope cannot be read from the image, and the reference values from the top-right panel (cross state).
- Make each improvements row an **element that was △/× in scoring**, with "weakness → improvement trigger" per row (elements that capped the score first, max 3 rows). Do not output it for overall 4 or higher.

### Past format deviations (concrete examples never to repeat)

In an evaluation of silver, the following deviations occurred when writing to Notion. These are prohibited:
- Moved the overall score to the top, as in "**Overall: 1/5** — Direction: …" (→ the overall is always the last section)
- Wrote "### Observations" as **bullet points with bold labels** instead of a table (→ always a 5-row table)
- Added **sections not in the template**, "### Conclusion" and "### Skip Decision" (→ fit them into the overall evaluation section and improvements)
- The axis heading score notation and the position of the supplement did not match the chat version (→ chat and Notion are completely identical)
- Wrote the overall evaluation as long prose including comparisons with other pairs and background (→ only the fixed 4-row table; the point goes in the "Main cause" column in one line)
- Wrote improvements as free-form ①②③ text (→ a "weakness → improvement trigger" table, one row per △/× element)

## Writing the evaluation result to Notion

When the user specifies a destination Notion page (e.g. "1. USDCAD inside 6/7-6/12"), write the evaluation result to that page.

Steps:
1. Find the specified parent/child page with the Notion search tool (the typical hierarchy is Trading Journal → week range name → currency pair name)
2. Fetch the page and **look for the "AI Evaluation" heading provided by the template. Write the evaluation result under that heading.** Only if there is no "AI Evaluation" heading, create one at the end of the page and write there
3. The content must have **exactly the same structure as the output-format template, word for word** (direction line, observations table, Axis 1 table + supplement, Axis 2 table + supplement, overall evaluation, improvements). Do not restructure, summarize, or add sections for Notion. Only a single evaluation-date stamp line may be added at the end
4. Also show the **identical evaluation result** in the chat, with a short note that writing to Notion is complete

If the page cannot be found or there are multiple candidates, do not write; confirm the candidates with the user.

## Retrieving chart images from a Notion page (flow for evaluating with only a page specified)

When the user specifies only a page name and has not attached an image in the chat, try to retrieve the image from the page and evaluate:

1. Fetch the page with the Notion fetch tool. Under the page's "## Execution TF" section is the image URL of the execution-timeframe chart (a signed URL on `prod-files-secure.s3.us-west-2.amazonaws.com`, valid for 1 hour)
2. In bash, download it with `curl -s -o /home/claude/chart_exec.png "<image URL>"` and confirm with the `file` command that it is a PNG/JPEG
3. Open the image with the view tool and perform the evaluation
4. Images in the "## Higher TF" section can be retrieved the same way, but the subject of evaluation is always the execution-timeframe line. Use higher-timeframe images only for contextual reference mentions
5. If the user's own notes on the page (description of their entry decision) can be read, still perform the evaluation itself independently from the image; after evaluating, you may comment on agreement/disagreement with the user's self-analysis

Fallback on failure:
- If the download fails with "Host not in allowlist" or similar, `prod-files-secure.s3.us-west-2.amazonaws.com` is not in the network allowlist. Guide the user to add it to the settings (takes effect from a new conversation), and in the meantime ask them to upload the image to the chat
- Signed URLs expire after 1 hour, so if the download fails, re-fetch the page to get a new URL and then retry

## Notes for evaluation

- State explicitly that information that cannot be read from the image (the slope of the higher-timeframe 200EMA = STEP 0) is outside the scope of evaluation. This skill evaluates only the line quality of STEP 3.
- Do not score in hindsight. Even if the price action after the break appears in the image, the evaluation is based on "could the line be drawn, and was it valid, before the break." A winning trade with a badly drawn line can be rated low, and a losing trade with a correctly drawn line can be rated high.
- If no line is drawn on the image, first diagnose "can a valid line be drawn?" If it can, evaluate assuming you drew it yourself; if it cannot, report that fact itself as a low score on Axis 1 (only a forced line is possible = skip).
