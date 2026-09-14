import type { StrategyDefinition } from "../types";

export const ema20: StrategyDefinition = {
  id: "ema20",
  name: "20EMA手法",
  shortName: "20EMA",
  description:
    "20/200EMAクロス後の初回20EMAタッチ(=エリオット第2波)からの実体ブレイクで第3波を獲る手法。鋭い第一波と転換波動内のTP基準が土台。上位足の方向感・AOIは画像から判定できないため採点対象外。",
  enabled: true,
  execTimeframes: ["5m", "1h"],
  higherTimeframes: { "5m": ["30m", "1h"], "1h": ["4h", "D"] },
  resultTitle: "20EMA手法 エントリー評価",
  higherTfLabel: "上位足",
  observations: [
    { key: "①", label: "クロス", hint: "20/200EMAクロスの種別(GC/DC)・方向・位置。タッチ印がクロス後初回か" },
    { key: "②", label: "第一波", hint: "クロス後の推進波の方向・鋭さ・値幅。高安値が形成され更新されずに戻っているか" },
    { key: "③", label: "転換波動・TP基準", hint: "左側に旧トレンド否定の高安値構造があるか。TP基準の高安値(灰色線)が転換波動内にあるか" },
    { key: "④", label: "調整波", hint: "戻しの形(スイング/横ばい・スクイーズ)、20EMAタッチの明確さ、200EMAとの距離" },
    { key: "⑤", label: "トリガー", hint: "タッチ足の最高安値(灰色線)を実体でブレイク確定したか。トリガーラインの質。建値/SL/TPボックスの位置" },
  ],
  axes: [
    {
      key: "axis1",
      label: "構造の質",
      subtitle: "第一波＋転換波動＋TP基準",
      elements: [
        { key: "A1", label: "第一波の鋭さ", core: true, pass: "クロス後に明確なエクスパンション(鋭い推進波)がある", fail: "ジリ上げ/ジリ下げ、推進と呼べない緩慢な動き" },
        { key: "A2", label: "第一波の完成", core: true, pass: "第一波の高安値が形成され、更新されないまま価格が戻ってきている", fail: "第一波が観測できない/未完成、戻る前に高安値を更新" },
        { key: "A3", label: "転換波動・TP基準", core: false, pass: "左側に旧トレンド否定の高安値構造があり、TP基準の高安値(灰色線)が転換波動内にある", fail: "転換波動構造がない、またはTP基準が転換波動内に引けない(即見送り条件)" },
        { key: "A4", label: "クロス整合・初回", core: false, pass: "20/200クロスが明確で、タッチがクロス後初回(緑/オレンジ印が初回位置)", fail: "クロスが曖昧、初回でない反復タッチ" },
      ],
    },
    {
      key: "axis2",
      label: "調整・トリガーの質",
      subtitle: "最重要・負けの主因軸",
      elements: [
        { key: "B1", label: "戻しの形", core: true, pass: "調整がスイング高安値をつけながら戻り、再推進に向かう形", fail: "ジリジリ横ばい/スクイーズ(モメンタム消失、200EMA舐め)" },
        { key: "B2", label: "タッチの明確さ", core: false, pass: "20EMAに明確にタッチ(緑/オレンジ印が明確)", fail: "タッチ位置が曖昧、「タッチしたとみなす」" },
        { key: "B3", label: "ブレイク確定", core: true, pass: "タッチ足の最高安値(灰色線)を実体でブレイク済み", fail: "先回り、ヒゲ抜けのみ、ブレイク前に飛び乗り" },
        { key: "B4", label: "トリガーライン質", core: false, pass: "トリガーラインがスイング高安値を通る有効なライン", fail: "最安値と近接点を結んだお粗末なライン、引けない" },
      ],
    },
  ],
  verdicts: [
    { score: 5, label: "適格(模範級)", meaning: "模範例と同等の形" },
    { score: 4, label: "適格(標準)", meaning: "有効なエントリー。通常通り執行可" },
    { score: 3, label: "要注意", meaning: "形は成立するが弱点あり。実体ブレイク確定待ち・戻しのスイング完成待ちを推奨" },
    { score: 2, label: "見送り推奨", meaning: "中核要素の崩れ、または特則該当。入らない" },
    { score: 1, label: "見送り(明確な罠)", meaning: "横ばい/スクイーズ/先回り/即見送り条件該当。実トレードの負けパターン" },
  ],
  specialRules: [
    { key: "squeeze200", label: "200EMA直下スクイーズ", description: "価格が200EMAとラインの間で圧縮・揉み合い → 総合上限2" },
    { key: "flatPullback", label: "ジリジリ横ばいの戻し", description: "調整がスイングをつけず200EMAを舐めるように張り付きボラ収縮(B1=×と同症状) → 総合上限2" },
    { key: "immediateSkip", label: "即見送り条件", description: "第一波が観測できない/未完成(A1またはA2が×)、転換波動構造がない、TP基準が転換波動内に引けない、タッチ後の次の足で最高安値をブレイク → 総合1" },
  ],
  overallExtraRows: [
    { key: "immediateSkip", label: "即見送り", hint: "該当なし / 該当時は条件名を明記 → 総合1" },
    { key: "rr", label: "RR", hint: "建値・SL・TP基準から想定RRR ≈ 1:X.X(1:1未満なら見送り旨を付す)" },
  ],
  docs: [{ name: "判定スキル(ema20-entry-eval)", path: "SKILL.md", role: "skill" }],
  promptNotes:
    "このスキルは執行足の20EMAエントリー品質のみを評価する。上位足の方向感・AOIは採点対象外であり、overall.step0 には「上位足は採点対象外(参考言及のみ)」と記す。即見送り条件に該当すれば軸の点に関わらず総合1、特則(200EMA警戒)に該当すれば総合上限2。RRは採点軸に含めないが overall.extra の rr 行に概算を記す。結果論で採点しない。",
};
