import type { StrategyDefinition } from "../types";

export const ema200: StrategyDefinition = {
  id: "ema200",
  name: "200EMA手法",
  shortName: "200EMA",
  description:
    "20/200EMAクロスで方向感を確定し、200EMAタッチ後の調整波スイング高安値を結ぶ切り下げ/切り上げラインの実体ブレイクでエントリー。上位足200EMAの傾きをSTEP 0フィルターとする。",
  enabled: true,
  execTimeframes: ["1m", "5m", "1h"],
  higherTimeframes: { "1m": ["15m", "1h"], "5m": ["15m", "1h"], "1h": ["4h", "D"] },
  resultTitle: "ライン評価結果",
  numericPlaceholder: '{"A": 1.9930, "B": 1.9905, "E": 1.9910, "X": 1.99194, "sl": 1.9900, "tp": 1.9990}',
  observations: [
    { key: "①", label: "推進波", hint: "方向/時間幅/値幅/EMAクロスの有無(=N計算・規模比較の基準)" },
    { key: "②", label: "調整波", hint: "起点(推進波の終点ピボット)/時間幅/戻しの深さ/200EMA到達の有無" },
    { key: "③", label: "ピボット", hint: "調整波内で認定したスイング高安値の列挙(認定基準: 調整幅の3割以上の押し/戻り)" },
    { key: "④", label: "ライン", hint: "起点の位置/経由ピボット数/価格の反応回数(タッチ→反発)" },
    {
      key: "⑤",
      label: "EMA関係",
      hint: "執行足200EMAの傾き/タッチ印の位置/ラインとEMA間のスクイーズ(確定要件)/接触ゾーンの本数/200EMA反応の質(反発・中間・張り付き・未確定)",
    },
  ],
  axes: [
    {
      key: "axis1",
      label: "スイング明確性",
      subtitle: "波動構造の質",
      elements: [
        { key: "S1", label: "波動リズム", core: true, pass: "調整波が押し/戻りを伴う明確な波動を形成", fail: "ジリ下げ/上げ、レンジ" },
        { key: "S2", label: "ピボット反応", core: true, pass: "反応済みピボット2点以上を結ぶ", fail: "価格が一度も反応していない、実質1ピボット" },
        { key: "S3", label: "反転構造", core: false, pass: "ダブルトップ/ボトム、三尊を構成", fail: "構造が認定できない" },
        { key: "S4", label: "一意性", core: false, pass: "他に同等に妥当なラインがほぼ引けない", fail: "同等のラインが3本引ける" },
      ],
    },
    {
      key: "axis2",
      label: "角度・規模適合性",
      subtitle: "ラインの規模と狙う動きの規模の一致",
      elements: [
        { key: "K1", label: "起点一致", core: true, pass: "起点が調整波の起点にあり調整全体を覆う", fail: "末端の加速したサブ波動だけを捉えている" },
        { key: "K2", label: "相対傾斜", core: true, pass: "直前の推進波より明確に緩やか", fail: "推進並み〜それ以上の急傾斜" },
        { key: "K3", label: "規模の充足", core: false, pass: "複数スイングを含む時間・本数、戻りが推進起点を超えない", fail: "極小ライン / 戻りがトレンド否定に変質" },
        { key: "K4", label: "ブレイク位置", core: false, pass: "戻し率 r ≤ 0.33", fail: "r > 0.50(EMAから乖離した遅いブレイク)" },
      ],
    },
  ],
  verdicts: [
    { score: 5, label: "適格(模範級)", meaning: "模範例と同等。STEP 0通過済みなら執行してよい形" },
    { score: 4, label: "適格(標準)", meaning: "有効なライン。サイズ管理を通常通り行い執行可" },
    { score: 3, label: "要注意", meaning: "形は成立しているが弱点あり。追加確認を推奨" },
    { score: 2, label: "見送り推奨", meaning: "手法の見送り条件に実質該当。入らない" },
    { score: 1, label: "見送り(明確な罠)", meaning: "ビルドアップ/スクイーズ/無理引き" },
  ],
  specialRules: [
    { key: "squeeze", label: "スクイーズ", description: "ラインと200EMAの収束ウェッジ内で3本以上のボラ収縮+両境界への交互タッチが陽性確認された場合のみ → 総合上限2" },
    { key: "sticking", label: "EMA張り付き", description: "接触ゾーン3本以上で c≥3 または a≤0.15 が陽性確認された場合のみ → 総合上限2" },
  ],
  overallRows: [
    { key: "gate", label: "ゲート", hint: "例: min(軸1 4, 軸2 3)= 3" },
    { key: "specialRule", label: "特則", hint: "スクイーズ/EMA張り付きの該当/非該当と根拠" },
    { key: "mainCause", label: "主因", hint: "総合点を縛った1要素を15〜40字で" },
    { key: "step0", label: "STEP 0", hint: "上位足フィルターの扱い(画像外/参考値)" },
  ],
  docs: [
    { name: "判定スキル(trendline-eval)", path: "SKILL.md", role: "skill" },
    { name: "手法概要", path: "references/strategy-overview.md", role: "reference" },
    { name: "手法要点(ライン評価に必要な範囲)", path: "references/methodology.md", role: "reference" },
    { name: "模範例の分析記録・校正アンカー", path: "references/ideal-examples.md", role: "reference" },
  ],
  promptNotes:
    "このスキルはSTEP 3のライン品質のみを評価する。STEP 0(上位足の傾き)は画像から読めなければ評価対象外と明記する。結果論で採点しない。",
};
