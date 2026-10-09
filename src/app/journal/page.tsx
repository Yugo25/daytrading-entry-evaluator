import Link from "next/link";
import { prisma } from "@/lib/db";
import { fmtPct, fmtWeekRange, quadrant, type Outcome } from "@/lib/journal";
import { strategyName, strategies } from "@/strategies";
import { ScoreBadge } from "@/components/ScoreBadge";
import { updateWeek } from "./actions";

const outcomeLabel: Record<string, string> = { WIN: "Win", BE: "BE", LOSS: "Loss" };

export default async function JournalPage({ searchParams }: PageProps<"/journal">) {
  const sp = await searchParams;
  const strategyId = typeof sp.strategy === "string" ? sp.strategy : "";
  const pair = typeof sp.pair === "string" ? sp.pair.toUpperCase() : "";
  const outcome = typeof sp.outcome === "string" ? sp.outcome : "";
  const compliance = typeof sp.compliance === "string" ? sp.compliance : "";

  const weeks = await prisma.week.findMany({
    orderBy: { startDate: "desc" },
    include: {
      trades: {
        where: {
          ...(strategyId && { strategyId }),
          ...(pair && { pair: { contains: pair } }),
          ...(outcome && { outcome }),
          ...(compliance && { ruleCompliance: compliance === "yes" }),
        },
        orderBy: { date: "asc" },
        include: { setup: { include: { evaluations: { orderBy: { createdAt: "desc" }, take: 1, include: { review: true } } } } },
      },
    },
  });
  const filtered = weeks.filter((w) => w.trades.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Trading Journal</h1>
        <Link href="/journal/new" className="btn-primary">+ Log trade</Link>
      </div>

      <form className="card flex flex-wrap items-end gap-3 text-sm">
        <div><label className="label">Strategy</label><select className="input" name="strategy" defaultValue={strategyId}><option value="">All</option>{strategies.map((s) => <option key={s.id} value={s.id}>{s.shortName}</option>)}</select></div>
        <div><label className="label">Pair</label><input className="input font-mono uppercase" name="pair" defaultValue={pair} placeholder="XAUUSD" /></div>
        <div><label className="label">Outcome</label><select className="input" name="outcome" defaultValue={outcome}><option value="">All</option><option value="WIN">Win</option><option value="BE">BE</option><option value="LOSS">Loss</option></select></div>
        <div><label className="label">Compliance</label><select className="input" name="compliance" defaultValue={compliance}><option value="">All</option><option value="yes">Yes</option><option value="no">No</option></select></div>
        <button className="btn-ghost">Filter</button>
        {(strategyId || pair || outcome || compliance) && <Link href="/journal" className="text-xs text-muted">Clear</Link>}
      </form>

      {filtered.length === 0 && <p className="card text-sm text-muted">No trades yet. Add one from an evaluation page or with “+ Log trade”.</p>}

      {filtered.map((w) => {
        const pnl = w.trades.reduce((s, t) => s + (t.resultPct ?? 0), 0);
        const wins = w.trades.filter((t) => t.outcome === "WIN").length;
        return (
          <section key={w.id} className="card space-y-3 p-0">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
              <div>
                <h2 className="font-semibold">{fmtWeekRange(w.startDate, w.endDate)} <span className={pnl >= 0 ? "text-emerald-600" : "text-red-600"}>{fmtPct(pnl)}</span></h2>
                <details>
                  <summary className="cursor-pointer text-sm text-muted">{w.theme ?? "Set weekly theme"}</summary>
                  <form action={updateWeek.bind(null, w.id)} className="mt-2 grid max-w-xl gap-2">
                    <input className="input" name="theme" placeholder="Weekly theme (e.g. Wait patiently until the fish bites. Waiting is the job.)" defaultValue={w.theme ?? ""} />
                    <textarea className="input" name="review" rows={3} placeholder="Weekly review" defaultValue={w.review ?? ""} />
                    <button className="btn-ghost w-fit">Save</button>
                  </form>
                </details>
              </div>
              <div className="text-xs text-muted">{w.trades.length} trades · {wins}W {w.trades.filter((t) => t.outcome === "LOSS").length}L {w.trades.filter((t) => t.outcome === "BE").length}BE</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-sm">
                <thead className="text-left text-xs text-muted">
                  <tr>{["Journal", "Date", "Time", "Type", "TF", "Line", "AOI", "Outcome", "Risk", "RRR", "Result", "Market", "Compliant", "Quadrant", "Violation", "AI Score"].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {w.trades.map((t) => {
                    const ev = t.setup?.evaluations[0];
                    return (
                      <tr key={t.id} className="border-t border-border hover:bg-border/20">
                        <td className="px-3 py-2 font-medium"><Link href={`/trades/${t.id}`} className="hover:underline">{t.journalNo}. {t.pair}</Link></td>
                        <td className="px-3 py-2 whitespace-nowrap">{new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", month: "numeric", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" }).format(t.date)}</td>
                        <td className="px-3 py-2">{t.holdTime ?? "—"}</td>
                        <td className="px-3 py-2">{strategyName(t.strategyId)}</td>
                        <td className="px-3 py-2">{t.execTf}</td>
                        <td className="px-3 py-2">{t.lineGrade ?? "—"}</td>
                        <td className="px-3 py-2">{t.aoiGrade ?? "—"}</td>
                        <td className={`px-3 py-2 font-medium ${t.outcome === "WIN" ? "text-emerald-600" : t.outcome === "LOSS" ? "text-red-600" : "text-muted"}`}>{outcomeLabel[t.outcome]}</td>
                        <td className="px-3 py-2">{t.riskPct != null ? `${t.riskPct}%` : "—"}</td>
                        <td className="px-3 py-2">{t.rrr ?? "—"}</td>
                        <td className={`px-3 py-2 font-mono ${(t.resultPct ?? 0) > 0 ? "text-emerald-600" : (t.resultPct ?? 0) < 0 ? "text-red-600" : ""}`}>{fmtPct(t.resultPct)}</td>
                        <td className="px-3 py-2">{t.market ?? "—"}</td>
                        <td className="px-3 py-2">{t.ruleCompliance ? "Yes" : <span className="text-red-600">No</span>}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{quadrant(t.ruleCompliance, t.outcome as Outcome)}</td>
                        <td className="px-3 py-2 text-xs text-muted">{t.violationContent ?? ""}</td>
                        <td className="px-3 py-2">{ev ? <Link href={`/setups/${t.setupId}`}><ScoreBadge score={ev.overallScore} size="sm" />{ev.review && <span className="ml-1 text-[10px] text-muted">{ev.review.agree ? "✓" : "✗"}</span>}</Link> : <span className="text-xs text-muted">—</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
