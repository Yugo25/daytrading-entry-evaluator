"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { deleteFile } from "@/lib/storage";

export async function submitReview(formData: FormData) {
  const evaluationId = String(formData.get("evaluationId"));
  const agree = formData.get("agree") === "yes";
  const comment = String(formData.get("comment") ?? "").trim();
  if (!comment) throw new Error("コメント(なぜ同意/不同意か)は必須です。これが学習データになります");
  const correctedScoreRaw = String(formData.get("correctedScore") ?? "");
  const correctedScore = !agree && correctedScoreRaw ? Number(correctedScoreRaw) : null;

  const corrected: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    if (k.startsWith("el_") && typeof v === "string" && v) corrected[k.slice(3)] = v;
  }
  const ev = await prisma.evaluation.findUniqueOrThrow({ where: { id: evaluationId } });
  await prisma.review.upsert({
    where: { evaluationId },
    create: { evaluationId, agree, correctedScore, correctedElements: agree ? null : JSON.stringify(corrected), comment, useAsExample: formData.get("useAsExample") === "yes" },
    update: { agree, correctedScore, correctedElements: agree ? null : JSON.stringify(corrected), comment, useAsExample: formData.get("useAsExample") === "yes" },
  });
  revalidatePath(`/setups/${ev.setupId}`);
}

export async function deleteSetup(setupId: string) {
  const setup = await prisma.setup.findUniqueOrThrow({ where: { id: setupId }, include: { images: true } });
  await prisma.setup.delete({ where: { id: setupId } }); // Evaluation / Review は cascade、Trade は setupId が null になる
  await Promise.all(setup.images.map((img) => deleteFile(img.path).catch(() => undefined)));
  revalidatePath("/setups");
  revalidatePath("/journal");
  redirect("/setups");
}
