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
    if (!allowed.has(f.type)) throw new Error(`未対応の画像形式: ${f.type}`);
    const ext = f.type.split("/")[1].replace("jpeg", "jpg");
    const rel = `${setupId}/${role.toLowerCase()}-${order}.${ext}`;
    await saveFile(rel, Buffer.from(await f.arrayBuffer()), f.type);
    await prisma.setupImage.create({ data: { setupId, role, path: rel, mimeType: f.type, order: order++ } });
  }
  return order;
}

export async function createAndEvaluate(formData: FormData) {
  const strategyId = String(formData.get("strategyId"));
  const strategy = getStrategy(strategyId);
  const execTf = String(formData.get("execTf"));
  if (!strategy.execTimeframes.includes(execTf)) throw new Error("執行足が不正です");
  const pair = String(formData.get("pair") ?? "").trim().toUpperCase();
  if (!pair) throw new Error("通貨ペアは必須です");
  const direction = String(formData.get("direction") ?? "") || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const numericRaw = String(formData.get("numericData") ?? "").trim();
  let numericData: string | null = null;
  if (numericRaw) {
    try { numericData = JSON.stringify(JSON.parse(numericRaw)); } catch { throw new Error("数値データはJSON形式で入力してください"); }
  }

  const execImages = formData.getAll("execImages").filter((f): f is File => f instanceof File && f.size > 0);
  const higherImages = formData.getAll("higherImages").filter((f): f is File => f instanceof File && f.size > 0);
  if (!execImages.length && !numericData) throw new Error("執行足チャート画像か数値データのどちらかは必要です");

  const setup = await prisma.setup.create({ data: { strategyId, pair, direction, execTf, notes, numericData } });
  const n = await storeImages(setup.id, execImages, "EXEC", 0);
  await storeImages(setup.id, higherImages, "HIGHER", n);

  await runEvaluation(setup.id);
}

export async function reEvaluate(setupId: string) {
  await runEvaluation(setupId);
}

// 画像・入力は保存済みなので、判定に失敗しても詳細ページで「再判定」できるようにする
async function runEvaluation(setupId: string) {
  let error: string | null = null;
  try {
    await evaluateSetup(setupId);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }
  redirect(error ? `/setups/${setupId}?error=${encodeURIComponent(error)}` : `/setups/${setupId}`);
}
