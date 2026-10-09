import Link from "next/link";
import { prisma } from "@/lib/db";
import { fileUrl } from "@/lib/storage";
import { fmtDateJst } from "@/lib/journal";
import { strategyName } from "@/strategies";
import { ScoreBadge } from "@/components/ScoreBadge";

export const dynamic = "force-dynamic";

export default async function SetupsPage() {
  const setups = await prisma.setup.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      images: { where: { role: "EXEC" }, orderBy: { order: "asc" }, take: 1 },
      evaluations: { orderBy: { createdAt: "desc" }, take: 1, include: { review: true } },
      trade: { select: { id: true, outcome: true } },
    },
  });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Setups</h1>
        <Link href="/evaluate" className="btn-primary">+ New evaluation</Link>
      </div>
      {setups.length === 0 && <p className="card text-sm text-muted">No evaluations yet.</p>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {setups.map((s) => {
          const ev = s.evaluations[0];
          const img = s.images[0];
          return (
            <Link key={s.id} href={`/setups/${s.id}`} className="card flex gap-3 p-3 hover:border-accent">
              {img ? <img src={fileUrl(img.path)} alt="" className="h-20 w-28 flex-none rounded object-cover" /> : <div className="h-20 w-28 flex-none rounded bg-border/40 text-center text-[10px] leading-[5rem] text-muted">Numeric only</div>}
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-semibold">{s.pair} <span className="text-xs font-normal text-muted">{s.execTf} · {strategyName(s.strategyId)}{s.direction ? ` · ${s.direction}` : ""}</span></p>
                <p className="text-[11px] text-muted">{fmtDateJst(s.createdAt)}</p>
                <div className="flex flex-wrap items-center gap-2">
                  {ev ? <ScoreBadge score={ev.overallScore} label={ev.overallLabel} size="sm" /> : <span className="rounded bg-border px-1.5 py-0.5 text-[11px] text-muted">No result / failed</span>}
                  {ev?.review && <span className="text-[11px]">{ev.review.agree ? "✓ Agreed" : `✗ Corrected→${ev.review.correctedScore}`}</span>}
                  {ev && !ev.review && <span className="text-[11px] text-amber-600">Not reviewed</span>}
                  {s.trade && <span className="text-[11px] text-muted">Trade: {s.trade.outcome}</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
