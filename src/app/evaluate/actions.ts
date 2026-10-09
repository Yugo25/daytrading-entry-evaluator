"use server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { saveFile } from "@/lib/storage";
import { evaluateSetup } from "@/lib/evaluator/evaluate";
import { getStrategy } from "@/strategies";

const allowed = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

async function storeImages(setupId: string, files: File[], role: string, startOrder: number) {
  let order = startOrder;
  for (const f of files) {
    if (!f.size) continue;
    if (!allowed.has(f.type)) throw new Error(`Unsupported image format: ${f.type}`);
    const ext = f.type.split("/")[1].replace("jpeg", "jpg");
    const rel = `${setupId}/${role.toLowerCase()}-${order}.${ext}`;
    await saveFile(rel, Buffer.from(await f.arrayBuffer()), f.type);
    await prisma.setupImage.create({ data: { setupId, role, path: rel, mimeType: f.type, order: order++ } });
  }
  return order;
}

// In production, a throw inside a Server Action is collapsed into React error #441 and the cause is hidden,
// so errors in the input/save stage are returned as values and shown in the form. Evaluation-stage errors are carried over to the detail page.
export async function createAndEvaluate(formData: FormData): Promise<{ error: string } | void> {
  let setupId: string;
  try {
    setupId = await createSetup(formData);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("createSetup failed:", e);
    return { error: msg };
  }
  await runEvaluation(setupId);
}

async function createSetup(formData: FormData) {
  const strategyId = String(formData.get("strategyId"));
  const strategy = getStrategy(strategyId);
  const execTf = String(formData.get("execTf"));
  if (!strategy.execTimeframes.includes(execTf)) throw new Error("Invalid execution timeframe");
  const pair = String(formData.get("pair") ?? "").trim().toUpperCase();
  if (!pair) throw new Error("Pair is required");
  const direction = String(formData.get("direction") ?? "") || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const numericRaw = String(formData.get("numericData") ?? "").trim();
  let numericData: string | null = null;
  if (numericRaw) {
    try { numericData = JSON.stringify(JSON.parse(numericRaw)); } catch { throw new Error("Numeric data must be valid JSON"); }
  }

  const execImages = formData.getAll("execImages").filter((f): f is File => f instanceof File && f.size > 0);
  const higherImages = formData.getAll("higherImages").filter((f): f is File => f instanceof File && f.size > 0);
  if (!execImages.length && !numericData) throw new Error("Either an execution-TF chart image or numeric data is required");

  const setup = await prisma.setup.create({ data: { strategyId, pair, direction, execTf, notes, numericData } });
  const n = await storeImages(setup.id, execImages, "EXEC", 0);
  await storeImages(setup.id, higherImages, "HIGHER", n);
  return setup.id;
}

export async function reEvaluate(setupId: string) {
  await runEvaluation(setupId);
}

// Images and inputs are already saved, so even if evaluation fails it can be re-run from the detail page
async function runEvaluation(setupId: string) {
  let error: string | null = null;
  try {
    await evaluateSetup(setupId);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }
  redirect(error ? `/setups/${setupId}?error=${encodeURIComponent(error)}` : `/setups/${setupId}`);
}
