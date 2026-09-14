// ジャーナルの派生値。Notion CSVの列定義に対応する。

export type Outcome = "WIN" | "BE" | "LOSS";

export function quadrant(ruleCompliance: boolean, outcome: Outcome) {
  const win = outcome === "WIN";
  if (ruleCompliance && win) return "① 遵守×勝";
  if (ruleCompliance && !win) return "② 遵守×非勝";
  if (!ruleCompliance && win) return "③ 違反×勝";
  return "④ 違反×非勝";
}

/** JSTの時刻でセッションを推定(既存レポートの定義: Tokyo 〜17時 / NY 21時〜) */
export function inferMarket(date: Date): "Tokyo" | "London" | "NY" {
  const jstHour = (date.getUTCHours() + 9) % 24;
  if (jstHour >= 21 || jstHour < 5) return "NY";
  if (jstHour < 17) return "Tokyo";
  return "London";
}

/** 週の開始(月曜 00:00 UTC)を返す */
export function weekStart(date: Date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

export function weekEnd(start: Date) {
  const e = new Date(start);
  e.setUTCDate(e.getUTCDate() + 6);
  return e;
}

export function fmtWeekRange(start: Date, end: Date) {
  const f = (d: Date) => `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
  return `${f(start)}-${f(end)}`;
}

export function fmtPct(v: number | null | undefined) {
  if (v == null) return "—";
  const s = v.toFixed(2).replace(/\.?0+$/, "");
  return `${v > 0 ? "+" : ""}${s}%`;
}

export function fmtDateJst(d: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
