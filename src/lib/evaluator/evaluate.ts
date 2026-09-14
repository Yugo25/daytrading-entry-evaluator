import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { prisma } from "@/lib/db";
import { readFile } from "@/lib/storage";
import { getStrategy } from "@/strategies";
import { strategyVersion } from "@/strategies/docs";
import { EvaluationOutputSchema, type EvaluationOutput } from "./schema";
import { buildFewShotBlock, buildSystemPrompt, type FewShotExample } from "./prompt";
import { renderEvaluation } from "./render";

const client = new Anthropic();
const MODEL = process.env.EVAL_MODEL ?? "claude-opus-5";
const EFFORT = (process.env.EVAL_EFFORT ?? "high") as "low" | "medium" | "high" | "xhigh" | "max";
const FEW_SHOT_LIMIT = 8;

type ImageMedia = "image/png" | "image/jpeg" | "image/webp" | "image/gif";

async function loadFewShot(strategyId: string): Promise<FewShotExample[]> {
  // 不同意(訂正あり)を優先し、同意例も少量混ぜて「正しく判定できた形」も示す
  const reviews = await prisma.review.findMany({
    where: { useAsExample: true, evaluation: { strategyId } },
    include: { evaluation: { include: { setup: true } } },
    orderBy: [{ agree: "asc" }, { createdAt: "desc" }],
    take: FEW_SHOT_LIMIT,
  });
  return reviews.map((r) => ({
    reviewId: r.id,
    pair: r.evaluation.setup.pair,
    execTf: r.evaluation.setup.execTf,
    aiOutput: JSON.parse(r.evaluation.structured) as EvaluationOutput,
    agree: r.agree,
    correctedScore: r.correctedScore,
    correctedElements: r.correctedElements ? (JSON.parse(r.correctedElements) as Record<string, string>) : null,
    comment: r.comment,
  }));
}

export async function evaluateSetup(setupId: string) {
  const setup = await prisma.setup.findUniqueOrThrow({
    where: { id: setupId },
    include: { images: { orderBy: { order: "asc" } } },
  });
  const strategy = getStrategy(setup.strategyId);
  if (!strategy.enabled) throw new Error(`${strategy.name} はまだ有効化されていません`);

  const fewShot = await loadFewShot(strategy.id);
  const system = buildSystemPrompt(strategy);

  const content: Anthropic.ContentBlockParam[] = [];
  for (const img of setup.images) {
    const data = (await readFile(img.path)).toString("base64");
    const roleLabel = img.role === "EXEC" ? "執行足チャート(評価対象)" : img.role === "HIGHER" ? `上位足チャート(${strategy.higherTfLabel ?? "STEP 0"}の参考)` : "補足画像";
    content.push({ type: "text", text: `[${roleLabel}: ${img.mimeType}]` });
    content.push({ type: "image", source: { type: "base64", media_type: img.mimeType as ImageMedia, data } });
  }
  const userLines = [
    `通貨ペア: ${setup.pair}`,
    `執行足: ${setup.execTf}(${strategy.higherTfLabel ?? "STEP 0"}参照足: ${strategy.higherTimeframes[setup.execTf]?.join("・") ?? "—"})`,
    setup.direction ? `想定方向: ${setup.direction}` : "想定方向: 未指定(画像から読み取る)",
  ];
  if (setup.numericData) userLines.push("数値データ(JSON):", setup.numericData);
  if (setup.notes) userLines.push("ユーザーメモ(評価本体は画像から独立に行い、評価後に一致/相違に触れてよい):", setup.notes);
  const fewShotBlock = buildFewShotBlock(fewShot);
  if (fewShotBlock) userLines.push("", fewShotBlock);
  userLines.push("", "上記のセットアップを手法基準に照らして評価し、JSONスキーマに従って出力してください。");
  content.push({ type: "text", text: userLines.join("\n") });

  // 長い思考を伴うためストリーミングで受ける(非ストリーミングだとHTTPタイムアウト→再試行で数分〜十数分かかる)
  const response = await client.messages
    .stream(
      {
        model: MODEL,
        max_tokens: 32000,
        thinking: { type: "adaptive" },
        output_config: { effort: EFFORT, format: zodOutputFormat(EvaluationOutputSchema) },
        system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content }],
      },
      { maxRetries: 0 },
    )
    .finalMessage();

  if (response.stop_reason === "refusal") {
    throw new Error(`モデルが応答を拒否しました: ${response.stop_details?.explanation ?? ""}`);
  }
  const out = response.parsed_output;
  if (!out) throw new Error("構造化出力の解析に失敗しました");

  const evaluation = await prisma.evaluation.create({
    data: {
      setupId: setup.id,
      strategyId: strategy.id,
      strategyVersion: strategyVersion(strategy),
      model: response.model,
      structured: JSON.stringify(out),
      rendered: renderEvaluation(strategy, out),
      overallScore: out.overall.score,
      overallLabel: out.overall.label,
      fewShotIds: JSON.stringify(fewShot.map((f) => f.reviewId)),
      inputTokens: response.usage.input_tokens + (response.usage.cache_read_input_tokens ?? 0) + (response.usage.cache_creation_input_tokens ?? 0),
      outputTokens: response.usage.output_tokens,
    },
  });
  return evaluation;
}
