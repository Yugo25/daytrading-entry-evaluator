import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { TradeForm } from "@/components/TradeForm";
import { ScoreBadge } from "@/components/ScoreBadge";
import { deleteTrade, updateTrade } from "@/app/journal/actions";
import { fileUrl } from "@/lib/storage";
import { strategyName } from "@/strategies";

export default async function TradePage({ params }: PageProps<"/trades/[id]">) {
  const { id } = await params;
  const trade = await prisma.trade.findUnique({
    where: { id },
    include: { setup: { include: { images: { orderBy: { order: "asc" } }, evaluations: { orderBy: { createdAt: "desc" }, take: 1, include: { review: true } } } } },
  });
  if (!trade) notFound();
  const ev = trade.setup?.evaluations[0];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{trade.journalNo}. {trade.pair} <span className="text-base font-normal text-muted">{strategyName(trade.strategyId)} · {trade.execTf}</span></h1>
        <form action={deleteTrade.bind(null, trade.id)}><button className="btn-ghost text-red-600">削除</button></form>
      </div>
      {trade.setup ? (
        <section className="card flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">AI判定</span>
            {ev ? <ScoreBadge score={ev.overallScore} label={ev.overallLabel} /> : <span className="text-sm text-muted">なし</span>}
            {ev?.review && <span className="text-xs">{ev.review.agree ? "✓ 判定に同意" : `✗ 訂正済み → ${ev.review.correctedScore ?? "?"}/5`}</span>}
          </div>
          <Link href={`/setups/${trade.setup.id}`} className="text-sm text-accent hover:underline">判定の詳細 →</Link>
          <div className="flex gap-2">{trade.setup.images.slice(0, 3).map((img) => <img key={img.id} src={fileUrl(img.path)} alt="" className="h-16 rounded border border-border" />)}</div>
        </section>
      ) : (
        <p className="text-sm text-muted">このトレードには判定が紐づいていません。<Link href="/evaluate" className="text-accent hover:underline">判定する</Link></p>
      )}
      <TradeForm action={updateTrade.bind(null, trade.id)} values={trade} submitLabel="更新" />
    </div>
  );
}
