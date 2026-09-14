import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { fileUrl } from "@/lib/storage";
import { getStrategy } from "@/strategies";
import type { EvaluationOutput } from "@/lib/evaluator/schema";
import { EvaluationView } from "@/components/EvaluationView";
import { ScoreBadge } from "@/components/ScoreBadge";
import { ReviewForm } from "./ReviewForm";
import { reEvaluate } from "@/app/evaluate/actions";
import { fmtDateJst } from "@/lib/journal";

export default async function SetupPage({ params, searchParams }: PageProps<"/setups/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : null;
  const setup = await prisma.setup.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      evaluations: { orderBy: { createdAt: "desc" }, include: { review: true } },
      trade: true,
    },
  });
  if (!setup) notFound();
  const strategy = getStrategy(setup.strategyId);
  const latest = setup.evaluations[0];
  const out = latest ? (JSON.parse(latest.structured) as EvaluationOutput) : null;
  const review = latest?.review
    ? { ...latest.review, correctedElements: latest.review.correctedElements ? (JSON.parse(latest.review.correctedElements) as Record<string, string>) : null }
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{setup.pair} <span className="text-base font-normal text-muted">{setup.execTf} · {strategy.name}{setup.direction ? ` · ${setup.direction}` : ""}</span></h1>
          <p className="text-xs text-muted">{fmtDateJst(setup.createdAt)} · 判定 {setup.evaluations.length} 回</p>
        </div>
        <div className="flex gap-2">
          {setup.trade ? (
            <Link href={`/trades/${setup.trade.id}`} className="btn-ghost">トレード記録を見る</Link>
          ) : (
            <Link href={`/journal/new?setupId=${setup.id}`} className="btn-ghost">この判定からトレード記録を作る</Link>
          )}
          <form action={reEvaluate.bind(null, setup.id)}><button className="btn-ghost">再判定</button></form>
        </div>
      </div>

      {error && <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-600">判定に失敗しました: {error}<br /><span className="text-xs">画像と入力は保存されています。原因を解消してから「再判定」を押してください。</span></div>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          {out && latest ? (
            <>
              <EvaluationView strategy={strategy} out={out} corrected={review?.correctedElements} />
              <ReviewForm evaluationId={latest.id} strategy={strategy} out={out} existing={review} />
              <details className="card text-xs">
                <summary className="cursor-pointer text-muted">Markdown(スキル出力テンプレート形式) / メタ情報</summary>
                <p className="mt-2 text-muted">model: {latest.model} · 基準ver: {latest.strategyVersion} · tokens in/out: {latest.inputTokens}/{latest.outputTokens} · 参照例: {JSON.parse(latest.fewShotIds).length}</p>
                <pre className="mt-2 whitespace-pre-wrap font-mono">{latest.rendered}</pre>
              </details>
            </>
          ) : (
            <p className="card text-sm text-muted">判定がまだありません。</p>
          )}
          {setup.evaluations.length > 1 && (
            <section className="card">
              <h3 className="mb-2 text-sm font-semibold">判定履歴</h3>
              <ul className="space-y-1 text-sm">
                {setup.evaluations.map((e) => (
                  <li key={e.id} className="flex items-center gap-3"><ScoreBadge score={e.overallScore} label={e.overallLabel} size="sm" /><span className="text-xs text-muted">{fmtDateJst(e.createdAt)} · {e.strategyVersion}</span>{e.review && <span className="text-xs">{e.review.agree ? "✓ 同意" : "✗ 訂正"}</span>}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
        <aside className="space-y-3">
          {setup.images.map((img) => (
            <figure key={img.id} className="card p-2">
              <a href={fileUrl(img.path)} target="_blank" rel="noreferrer"><img src={fileUrl(img.path)} alt="" className="w-full rounded" /></a>
              <figcaption className="mt-1 text-[11px] text-muted">{img.role === "EXEC" ? "執行足" : img.role === "HIGHER" ? "上位足" : "補足"}</figcaption>
            </figure>
          ))}
          {setup.numericData && <pre className="card overflow-auto font-mono text-xs">{JSON.stringify(JSON.parse(setup.numericData), null, 2)}</pre>}
          {setup.notes && <div className="card text-sm whitespace-pre-line"><p className="label">メモ</p>{setup.notes}</div>}
        </aside>
      </div>
    </div>
  );
}
