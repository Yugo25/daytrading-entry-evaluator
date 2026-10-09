"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { weekStart, weekEnd, inferMarket, type Outcome } from "@/lib/journal";

function num(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s.replace("%", ""));
  return Number.isFinite(n) ? n : null;
}
function str(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  return s || null;
}

async function ensureWeek(date: Date) {
  const start = weekStart(date);
  return prisma.week.upsert({ where: { startDate: start }, create: { startDate: start, endDate: weekEnd(start) }, update: {} });
}

function parseTrade(formData: FormData) {
  // datetime-local has no time zone → interpret as JST
  const dateStr = String(formData.get("date") ?? "");
  if (!dateStr) throw new Error("Date and time are required");
  const date = new Date(`${dateStr}:00+09:00`);
  const outcome = String(formData.get("outcome")) as Outcome;
  if (!["WIN", "BE", "LOSS"].includes(outcome)) throw new Error("Invalid outcome");
  const pair = String(formData.get("pair") ?? "").trim().toUpperCase();
  if (!pair) throw new Error("Pair is required");
  return {
    date,
    pair,
    strategyId: String(formData.get("strategyId")),
    execTf: String(formData.get("execTf")),
    holdTime: str(formData.get("holdTime")),
    lineGrade: str(formData.get("lineGrade")),
    aoiGrade: str(formData.get("aoiGrade")),
    outcome,
    riskPct: num(formData.get("riskPct")),
    rrr: num(formData.get("rrr")),
    resultPct: num(formData.get("resultPct")),
    market: str(formData.get("market")) ?? inferMarket(date),
    ruleCompliance: formData.get("ruleCompliance") === "yes",
    violationContent: str(formData.get("violationContent")),
    violationMotive: str(formData.get("violationMotive")),
    analysis: str(formData.get("analysis")),
    psychology: str(formData.get("psychology")),
  };
}

export async function createTrade(formData: FormData) {
  const data = parseTrade(formData);
  const setupId = str(formData.get("setupId"));
  const week = await ensureWeek(data.date);
  const count = await prisma.trade.count({ where: { weekId: week.id } });
  const trade = await prisma.trade.create({ data: { ...data, weekId: week.id, journalNo: count + 1, setupId } });
  revalidatePath("/journal");
  redirect(`/trades/${trade.id}`);
}

export async function updateTrade(id: string, formData: FormData) {
  const data = parseTrade(formData);
  const week = await ensureWeek(data.date);
  await prisma.trade.update({ where: { id }, data: { ...data, weekId: week.id } });
  revalidatePath("/journal");
  revalidatePath(`/trades/${id}`);
  redirect(`/trades/${id}`);
}

export async function deleteTrade(id: string) {
  await prisma.trade.delete({ where: { id } });
  revalidatePath("/journal");
  redirect("/journal");
}

export async function updateWeek(id: string, formData: FormData) {
  await prisma.week.update({ where: { id }, data: { theme: str(formData.get("theme")), review: str(formData.get("review")) } });
  revalidatePath("/journal");
}
