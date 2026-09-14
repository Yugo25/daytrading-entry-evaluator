# Entry Evaluator

手法基準に基づくデイトレードのセットアップ判定 + トレードジャーナル。

## 設計の核

**これは「手法適合判定器」であり「勝率予測器」ではない。**

```
手法ドキュメント + 判定スキル (src/strategies/<id>/)  ← 固定。人間だけが意図的に改訂する
        │ 判定の物差し
        ▼
 Setup 投入 ──▶ Evaluation(AI判定) ──▶ Review(あなたの訂正) ──▶ 次回判定の校正例
 (画像/数値/メモ)   軸・要素・総合・特則        同意 / 不同意+理由         (few-shot)

 Trade(勝敗・RR・心理) は別レーン。ジャーナル・統計に使い、判定ロジックには流さない。
```

- **判定訂正(Review)** は「同じ基準に対する読み取り精度」を上げるための校正データ。手法基準は変えない。
- **手法改訂** は `src/strategies/<id>/` のドキュメントを直接編集して行う。編集すると基準バージョン(ハッシュ)が変わり、以後の Evaluation に記録されるので「どの基準で判定されたか」が追跡できる。

## 構成

```
src/strategies/            手法プラグイン(判定器・UI・ジャーナルはここだけを見る)
  types.ts                 StrategyDefinition インターフェース
  index.ts                 レジストリ(getStrategy / enabledStrategies)
  docs.ts                  ドキュメント読み込み・基準バージョン算出
  ema200/                  200EMA手法(有効)
    index.ts               観察5要素・軸1(S1-S4)・軸2(K1-K4)・判定ラベル・特則・ドキュメント一覧
    SKILL.md               判定スキル本文(trendline-eval)
    references/            手法概要・要点・模範例/校正アンカー
  ema20/index.ts           20EMA手法(準備中: enabled:false)
src/lib/evaluator/
  schema.ts                構造化出力の zod スキーマ(手法非依存)
  prompt.ts                システムプロンプト(手法docs, キャッシュ) + 校正例ブロック
  evaluate.ts              Claude 呼び出し(vision + structured output) → Evaluation 保存
  render.ts                構造化出力 → スキルの出力テンプレート形式 Markdown
src/lib/journal.ts         4象限・セッション推定・週の計算
src/lib/storage.ts         画像保存(ローカルFS。クラウドでは Blob 実装に差し替え)
src/lib/auth.ts, proxy.ts  APP_PASSWORD による簡易ログイン
prisma/schema.prisma       Week / Setup / SetupImage / Evaluation / Review / Trade
scripts/import-notion-csv.mts  NotionのTrading Journal CSVをインポート
```

## 画面

| パス | 内容 |
|---|---|
| `/evaluate` | 手法・執行足・ペア・画像・数値・メモを投入して判定 |
| `/setups/[id]` | 判定結果(観察/軸/総合/改善提案)・レビュー(訂正)・再判定・トレード記録へのリンク |
| `/journal` | 週ごとのジャーナル表(Notion CSVと同じ列 + AI判定) ・フィルタ・週テーマ |
| `/journal/new`, `/trades/[id]` | トレード記録の作成・編集 |
| `/stats` | 成績統計 + **判定精度(同意率)** + **判定器の弱点(訂正された要素)** |
| `/strategies`, `/strategies/[id]` | 手法の基準・ドキュメントの閲覧 |

## セットアップ

```bash
cp .env.example .env    # ANTHROPIC_API_KEY を設定(または ant auth login)
npm install
npx prisma migrate dev  # data/app.db を作成
npm run dev
```

Notion CSV の取り込み:

```bash
npx tsx scripts/import-notion-csv.mts "path/to/週次.csv" "週テーマ"
```

## 新しい手法を追加する

1. `src/strategies/<id>/` にスキル本文と参照ドキュメントを置く
2. `src/strategies/<id>/index.ts` で `StrategyDefinition` を定義(観察要素・軸と要素・判定ラベル・特則・docs)
3. `src/strategies/index.ts` の配列に追加し `enabled: true`

判定・レビュー・ジャーナル・統計は自動で対応する。

## クラウド配置(Vercel等)の前に

- `APP_PASSWORD` を必ず設定する(未設定だと認証なし)
- SQLite + ローカルFSはサーバーレスでは永続しない → `DATABASE_URL` を Postgres に変え `src/lib/db.ts` のアダプタを `@prisma/adapter-pg` に、`src/lib/storage.ts` を Vercel Blob / S3 実装に差し替える(インターフェースは同じ3関数)
