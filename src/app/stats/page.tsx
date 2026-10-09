export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { fmtPct } from "@/lib/journal";
import { strategies, strategyName } from "@/strategies";

function Bar({ ratio, color = "bg-accent" }: { ratio: number; color?: string }) {
  return <div className="h-2 w-full rounded bg-border"><div className={`h-2 rounded ${color}`} style={{ width: `${Math.max(0, Math.min(100, ratio * 100))}%` }} /></div>;
}

function groupBy<T, K extends string>(xs: T[], f: (x: T) => K) {
  const m = new Map<K, T[]>();
  for (const x of xs) { const k = f(x); m.set(k, [...(m.get(k) ?? []), x]); }
  return [...m.entries()];
}

export default async function StatsPage() {
  const [trades, evaluations] = await Promise.all([
    prisma.trade.findMany({ include: { setup: { include: { evaluations: { orderBy: { createdAt: "desc" }, take: 1, include: { review: true } } } } } }),
    prisma.evaluation.findMany({ include: { review: true }, orderBy: { createdAt: "asc" } }),
  ]);

  const reviewed = evaluations.filter((e) => e.review);
  const agreeRate = reviewed.length ? reviewed.filter((e) => e.review!.agree).length / reviewed.length : 0;
  const recent = reviewed.slice(-20);
  const recentAgree = recent.length ? recent.filter((e) => e.review!.agree).length / recent.length : 0;

  // Frequency of corrected elements = weakness map of the evaluator
  const elementFix = new Map<string, number>();
  for (const e of reviewed) {
    if (e.review!.correctedElements) for (const k of Object.keys(JSON.parse(e.review!.correctedElements))) elementFix.set(k, (elementFix.get(k) ?? 0) + 1);
  }

  const summarize = (xs: typeof trades) => ({
    n: xs.length,
    w: xs.filter((t) => t.outcome === "WIN").length,
    l: xs.filter((t) => t.outcome === "LOSS").length,
    be: xs.filter((t) => t.outcome === "BE").length,
    pnl: xs.reduce((s, t) => s + (t.resultPct ?? 0), 0),
  });
  const total = summarize(trades);
  const byStrategy = groupBy(trades, (t) => t.strategyId);
  const byMarket = groupBy(trades, (t) => t.market ?? "—");
  const byPair = groupBy(trades, (t) => t.pair).sort((a, b) => b[1].length - a[1].length);
  const byQuadrant = groupBy(trades, (t) => `${t.ruleCompliance ? "Compliant" : "Violation"} × ${t.outcome === "WIN" ? "Win" : "Non-win"}`);
  // Results by AI score (to validate the evaluator. A reference for calibrating it, not grounds for changing the criteria)
  const byScore = groupBy(trades.filter((t) => t.setup?.evaluations[0]), (t) => String(t.setup!.evaluations[0].review?.correctedScore ?? t.setup!.evaluations[0].overallScore)).sort((a, b) => Number(b[0]) - Number(a[0]));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Stats</h1>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card"><p className="label">Total trades</p><p className="text-2xl font-semibold">{total.n}</p><p className="text-xs text-muted">{total.w}W / {total.l}L / {total.be}BE · win rate {total.n ? Math.round((total.w / total.n) * 100) : 0}%</p></div>
        <div className="card"><p className="label">Realized P&L</p><p className={`text-2xl font-semibold ${total.pnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmtPct(total.pnl)}</p></div>
        <div className="card">
          <p className="label">Evaluator accuracy (your agreement rate)</p>
          <p className="text-2xl font-semibold">{reviewed.length ? `${Math.round(agreeRate * 100)}%` : "—"}</p>
          <p className="text-xs text-muted">Reviewed {reviewed.length}/{evaluations.length} · last 20: {recent.length ? `${Math.round(recentAgree * 100)}%` : "—"}</p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card space-y-2">
          <h2 className="text-sm font-semibold">Evaluator weak spots (corrected elements)</h2>
          {elementFix.size === 0 ? <p className="text-xs text-muted">No corrections yet. They accumulate as you review evaluations.</p> :
            [...elementFix.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => (
              <div key={k} className="text-sm"><div className="flex justify-between"><span className="font-mono">{k}</span><span className="text-muted">{n}×</span></div><Bar ratio={n / reviewed.length} color="bg-orange-500" /></div>
            ))}
          <p className="text-[11px] text-muted">This is not grounds for changing the strategy criteria; it is a map of which elements the evaluator tends to misread.</p>
        </section>

        <section className="card space-y-2">
          <h2 className="text-sm font-semibold">Results by AI score</h2>
          {byScore.length === 0 ? <p className="text-xs text-muted">No trades linked to evaluations yet.</p> :
            byScore.map(([score, xs]) => { const s = summarize(xs); return (
              <div key={score} className="text-sm"><div className="flex justify-between"><span>{score}/5</span><span className="text-muted">{s.n} trades · {s.w}W · {fmtPct(s.pnl)}</span></div><Bar ratio={s.n ? s.w / s.n : 0} color="bg-emerald-500" /></div>
            ); })}
        </section>

        <section className="card space-y-2">
          <h2 className="text-sm font-semibold">By strategy</h2>
          {strategies.map((st) => { const xs = byStrategy.find(([k]) => k === st.id)?.[1] ?? []; const s = summarize(xs); return (
            <div key={st.id} className="text-sm"><div className="flex justify-between"><span>{st.shortName}</span><span className="text-muted">{s.n} trades · {s.w}W {s.l}L {s.be}BE · <span className={s.pnl >= 0 ? "text-emerald-600" : "text-red-600"}>{fmtPct(s.pnl)}</span></span></div><Bar ratio={s.n ? s.w / s.n : 0} /></div>
          ); })}
        </section>

        <section className="card space-y-2">
          <h2 className="text-sm font-semibold">Win rate by session</h2>
          {byMarket.map(([k, xs]) => { const s = summarize(xs); return (
            <div key={k} className="text-sm"><div className="flex justify-between"><span>{k}</span><span className="text-muted">{s.n ? Math.round((s.w / s.n) * 100) : 0}% ({s.w}W / {s.n}T)</span></div><Bar ratio={s.n ? s.w / s.n : 0} /></div>
          ); })}
        </section>

        <section className="card">
          <h2 className="mb-2 text-sm font-semibold">Quadrants</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {["Compliant × Win", "Compliant × Non-win", "Violation × Win", "Violation × Non-win"].map((q, i) => { const xs = byQuadrant.find(([k]) => k === q)?.[1] ?? []; return (
              <div key={q} className={`rounded-md border border-border p-3 ${i === 2 ? "bg-amber-500/10" : i === 3 ? "bg-red-500/10" : ""}`}><p className="text-xs text-muted">{["①", "②", "③", "④"][i]} {q}</p><p className="text-xl font-semibold">{xs.length}</p></div>
            ); })}
          </div>
        </section>

        <section className="card">
          <h2 className="mb-2 text-sm font-semibold">By pair</h2>
          <table className="w-full text-sm"><thead className="text-left text-xs text-muted"><tr><th className="py-1">Pair</th><th>Trades</th><th>Win rate</th><th>P&amp;L</th></tr></thead>
            <tbody>{byPair.map(([k, xs]) => { const s = summarize(xs); return <tr key={k} className="border-t border-border"><td className="py-1 font-mono">{k}</td><td>{s.n}</td><td>{Math.round((s.w / s.n) * 100)}%</td><td className={s.pnl >= 0 ? "text-emerald-600" : "text-red-600"}>{fmtPct(s.pnl)}</td></tr>; })}</tbody>
          </table>
        </section>
      </div>
      <p className="text-xs text-muted">Strategy names such as {strategyName("ema200")} are defined in src/strategies.</p>
    </div>
  );
}
