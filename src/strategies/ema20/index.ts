import type { StrategyDefinition } from "../types";

export const ema20: StrategyDefinition = {
  id: "ema20",
  name: "20EMA手法",
  shortName: "20EMA",
  description:
    "旧トレンドの構造を否定する第一波 → 20EMA初回タッチの第二波 → 旧トレンドが残した未到達の高安値をTPに第3波を獲る手法。左側の波動・構造否定・起点の維持・第二波確認・TP基準残存の5項目を価格を指名して判定する。上位足は採点対象外。",
  enabled: true,
  execTimeframes: ["1m", "5m", "1h"],
  higherTimeframes: { "1m": ["15m", "1h"], "5m": ["15m", "1h"], "1h": ["4h", "D"] },
  resultTitle: "20EMA手法 エントリー評価",
  higherTfLabel: "上位足",
  numericPlaceholder: '{"wave1_start": 2350.0, "wave1_extreme": 2381.5, "pullback_extreme": 2363.2, "tp_ref": 2396.0, "trigger": 2367.4, "entry": 2368.0, "sl": 2360.0, "tp": 2396.0}',
  observations: [
    { key: "①", label: "クロス", hint: "20/200EMAクロスの種別(GC/DC)・方向・位置。タッチ印がクロス後初回か" },
    { key: "②", label: "第一波", hint: "起点・極値の価格と値幅。旧トレンドのどの高安値を実体で抜いたか" },
    { key: "③", label: "転換波動・TP基準", hint: "左側の旧トレンドの高安値構造。TP基準(灰色線)が未到達で残っているか" },
    { key: "④", label: "調整波", hint: "戻りの極値。第一波の起点を超えていないか。20EMAタッチの有無" },
    { key: "⑤", label: "トリガー", hint: "タッチ足の高安値(灰色線)の価格。建値/SL/TPボックスの位置" },
  ],
  axes: [
    {
      key: "axis1",
      label: "判定",
      subtitle: "波動の形成順序が成立しているか(5項目)",
      elements: [
        { key: "W1", label: "左側の波動", core: true, pass: "旧トレンドの高安値構造を価格で指名できる", partial: "構造はあるが価格が特定しきれない", fail: "旧トレンドの構造が読めない(→総合1)" },
        { key: "W2", label: "構造否定", core: true, pass: "第一波が旧構造の押し安値/戻り高値を実体で抜いた", partial: "ヒゲ抜けのみ/抜けた水準が特定できない", fail: "抜いていない(→総合1)" },
        { key: "W3", label: "起点の維持", core: true, pass: "戻りの極値が第一波の起点を超えていない", partial: "起点と同値付近で判別困難", fail: "起点を超えた(→総合1)" },
        { key: "W4", label: "第二波の確認", core: false, pass: "20EMAに実タッチ、かつクロス後初回", partial: "タッチが未達/ほぼ接触で判別困難", fail: "2度目以降のタッチ(W4のみ×なら総合2=待ち)" },
        { key: "W5", label: "TP基準の残存", core: true, pass: "転換波動内に未到達の高安値があり灰色線と一致", partial: "TP線はあるが波動内の位置が曖昧", fail: "未到達の基準が残っていない(→総合1)" },
      ],
    },
  ],
  verdicts: [
    { score: 5, label: "適格(模範級)", meaning: "構造として完全。通常通り執行可" },
    { score: 4, label: "適格(標準)", meaning: "有効。△の確認を済ませて執行" },
    { score: 3, label: "要注意", meaning: "確認不足が複数。価格を確定させてから再判定" },
    { score: 2, label: "待ち", meaning: "タッチ未成立。成立を待って再評価" },
    { score: 1, label: "見送り", meaning: "構造が成立していない。執行では救えない" },
  ],
  specialRules: [
    { key: "immediateSkip", label: "即見送り条件", description: "上位足と執行足の方向不一致、または W1/W2/W3/W5 のいずれかが× → 総合1" },
  ],
  overallRows: [
    { key: "immediateSkip", label: "即見送り", hint: "該当なし / 該当時は条件名を明記 → 総合1" },
    { key: "higherTf", label: "上位足", hint: "方向一致/不一致。採点外の注記" },
    { key: "rr", label: "RR", hint: "建値・SL・TP基準から想定RRR ≈ 1:X.X(半利/全利があれば両方)" },
    { key: "mainCause", label: "主因", hint: "点数を決めた要素を一言" },
    { key: "nextAction", label: "次の行動", hint: "執行待ち/確認すべき価格/見送り、を一言" },
  ],
  docs: [{ name: "判定スキル(ema20-entry-eval)", path: "SKILL.md", role: "skill" }],
  promptNotes: [
    "このスキルは判定5項目(W1〜W5)を1つの軸(axis1)として出力し、換算表で決めた総合点を axis1.score と overall.score の両方に入れる。除外表にある項目を採点に持ち込まない。",
    "この評価器は対話できないため「価格を聞き返す」ことはできない。第一波の起点・極値・戻りの極値がユーザーの数値データ(JSON)やメモに無く、目視推定では判定の境界が誤差範囲内で接近する場合は、その項目を△とし、rows.nextAction に「確認すべき価格」を明記して再判定を促す。推測値で×を付けない。",
    "上位足の方向感・AOIは採点対象外。上位足画像が添付されていれば方向一致/不一致のみ rows.higherTf に記す(方向不一致は即見送り条件)。無ければ「画像なし・採点外」と記す。",
    "結果論で採点しない。",
  ].join(" "),
};
