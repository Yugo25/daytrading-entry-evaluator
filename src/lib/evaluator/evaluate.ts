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
  // Prioritize disagreements (with corrections), and mix in a few agreements to also show "what a correct judgment looks like"
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
  if (!strategy.enabled) throw new Error(`${strategy.name} is not enabled yet`);

  const fewShot = await loadFewShot(strategy.id);
  const system = buildSystemPrompt(strategy);

  const content: Anthropic.ContentBlockParam[] = [];
  for (const img of setup.images) {
    const data = (await readFile(img.path)).toString("base64");
    const roleLabel = img.role === "EXEC" ? "Execution-TF chart (subject of evaluation)" : img.role === "HIGHER" ? `Higher-TF chart (reference for ${strategy.higherTfLabel ?? "STEP 0"})` : "Supplementary image";
    content.push({ type: "text", text: `[${roleLabel}: ${img.mimeType}]` });
    content.push({ type: "image", source: { type: "base64", media_type: img.mimeType as ImageMedia, data } });
  }
  const userLines = [
    `Pair: ${setup.pair}`,
    `Execution TF: ${setup.execTf} (${strategy.higherTfLabel ?? "STEP 0"} reference TFs: ${strategy.higherTimeframes[setup.execTf]?.join(", ") ?? "—"})`,
    setup.direction ? `Intended direction: ${setup.direction}` : "Intended direction: not specified (read it from the image)",
  ];
  if (setup.numericData) userLines.push("Numeric data (JSON):", setup.numericData);
  if (setup.notes) userLines.push("User notes (perform the evaluation itself independently from the image; afterwards you may comment on agreement/disagreement):", setup.notes);
  const fewShotBlock = buildFewShotBlock(fewShot);
  if (fewShotBlock) userLines.push("", fewShotBlock);
  userLines.push("", "Evaluate the setup above against the strategy criteria and output according to the JSON schema. Write all text in English.");
  content.push({ type: "text", text: userLines.join("\n") });

  // Receive as a stream because of the long thinking (non-streaming hits HTTP timeouts → retries, taking several to 10+ minutes)
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
    throw new Error(`The model refused to respond: ${response.stop_details?.explanation ?? ""}`);
  }
  const out = response.parsed_output;
  if (!out) throw new Error("Failed to parse the structured output");

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
