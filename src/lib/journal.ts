// Derived journal values. Correspond to the column definitions of the Notion CSV.

export type Outcome = "WIN" | "BE" | "LOSS";

export function quadrant(ruleCompliance: boolean, outcome: Outcome) {
  const win = outcome === "WIN";
  if (ruleCompliance && win) return "① Compliant × Win";
  if (ruleCompliance && !win) return "② Compliant × Non-win";
  if (!ruleCompliance && win) return "③ Violation × Win";
  return "④ Violation × Non-win";
}

/** Infer the session from the JST time (definition from earlier reports: Tokyo until 17:00 / NY from 21:00) */
export function inferMarket(date: Date): "Tokyo" | "London" | "NY" {
  const jstHour = (date.getUTCHours() + 9) % 24;
  if (jstHour >= 21 || jstHour < 5) return "NY";
  if (jstHour < 17) return "Tokyo";
  return "London";
}

/** Return the start of the week (Monday 00:00 UTC) */
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
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZoneName: "short",
  }).format(d);
}
