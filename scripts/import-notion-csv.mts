// NotionのTrading Journal週次CSVをインポートする。
// usage: node scripts/import-notion-csv.ts <csv path> ["週テーマ"]
import fs from "node:fs";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { weekStart, weekEnd } from "../src/lib/journal.js";

const [, , csvPath, theme] = process.argv;
if (!csvPath) { console.error("usage: node scripts/import-notion-csv.ts <csv> [theme]"); process.exit(1); }

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const header = rows[0].map((h) => h.replace(/^﻿/, "").trim());
  return rows.slice(1).filter((r) => r.some(Boolean)).map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? "").trim()])));
}

const strategyMap: Record<string, string> = { "200EMA": "ema200", "20EMA": "ema20" };
const num = (s: string) => { const n = Number(s.replace("%", "")); return Number.isFinite(n) && s !== "" ? n : null; };

const url = (process.env.DATABASE_URL ?? "file:./data/app.db").replace(/^file:/, "");
const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });

const records = parseCsv(fs.readFileSync(csvPath, "utf8"));
let imported = 0;
for (const r of records) {
  // "August 24, 2026 22:50 (EDT)"
  const m = r.Date.match(/^(.+?)\s*\((\w+)\)$/);
  const tz = m?.[2] === "EDT" ? "-04:00" : m?.[2] === "EST" ? "-05:00" : m?.[2] === "JST" ? "+09:00" : "Z";
  const date = new Date(`${(m?.[1] ?? r.Date).replace(",", "")} ${tz}`);
  if (Number.isNaN(date.getTime())) { console.warn("skip (date):", r.Journal, r.Date); continue; }
  const start = weekStart(date);
  const week = await prisma.week.upsert({ where: { startDate: start }, create: { startDate: start, endDate: weekEnd(start), theme: theme ?? null }, update: theme ? { theme } : {} });
  const outcome = r.Win === "Yes" ? "WIN" : r.BE === "Yes" ? "BE" : "LOSS";
  const journalNo = Number(r.Journal.match(/^(\d+)\./)?.[1]) || null;
  const pair = r.Pair || r.Journal.replace(/^\d+\.\s*/, "");
  const exists = await prisma.trade.findFirst({ where: { weekId: week.id, pair, date } });
  if (exists) { console.log("exists:", r.Journal); continue; }
  await prisma.trade.create({
    data: {
      weekId: week.id, journalNo, date, pair,
      strategyId: strategyMap[r.Type] ?? r.Type.toLowerCase(),
      execTf: r.TF || "5m", holdTime: r.Time || null,
      lineGrade: r.Line || null, aoiGrade: r.AOI || null, outcome,
      riskPct: num(r.Risk), rrr: num(r.RRR), resultPct: num(r.Result), market: r.Market || null,
      ruleCompliance: r["ルール遵守"] !== "No",
      violationContent: r["違反内容"] || null, violationMotive: r["違反動機"] || null,
    },
  });
  imported++;
}
console.log(`imported ${imported}/${records.length}`);
await prisma.$disconnect();
