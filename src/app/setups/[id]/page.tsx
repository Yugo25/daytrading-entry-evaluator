import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { fileUrl } from "@/lib/storage";
import { getStrategy } from "@/strategies";
import type { EvaluationOutput } from "@/lib/evaluator/schema";
import { EvaluationView } from "@/components/EvaluationView";
import { ScoreBadge } from "@/components/ScoreBadge";
import { ReviewForm } from "./ReviewForm";
import { deleteSetup } from "./actions";
import { reEvaluate } from "@/app/evaluate/actions";
import { fmtDateJst } from "@/lib/journal";

export const maxDuration = 300;

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
          <p className="text-xs text-muted">{fmtDateJst(setup.createdAt)} · {setup.evaluations.length} evaluation(s)</p>
        </div>
        <div className="flex gap-2">
          {setup.trade ? (
            <Link href={`/trades/${setup.trade.id}`} className="btn-ghost">View trade</Link>
          ) : (
            <Link href={`/journal/new?setupId=${setup.id}`} className="btn-ghost">Log a trade from this evaluation</Link>
          )}
          <form action={reEvaluate.bind(null, setup.id)}><button className="btn-ghost">Re-evaluate</button></form>
          <form action={deleteSetup.bind(null, setup.id)}><button className="btn-ghost text-red-600">Delete</button></form>
        </div>
      </div>

      {error && <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-600">Evaluation failed: {error}<br /><span className="text-xs">Your images and inputs have been saved. Fix the cause, then press “Re-evaluate”.</span></div>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          {out && latest ? (
            <>
              <EvaluationView strategy={strategy} out={out} corrected={review?.correctedElements} />
              <ReviewForm evaluationId={latest.id} strategy={strategy} out={out} existing={review} />
              <details className="card text-xs">
                <summary className="cursor-pointer text-muted">Markdown (skill output template format) / metadata</summary>
                <p className="mt-2 text-muted">model: {latest.model} · criteria ver: {latest.strategyVersion} · tokens in/out: {latest.inputTokens}/{latest.outputTokens} · calibration examples: {JSON.parse(latest.fewShotIds).length}</p>
                <pre className="mt-2 whitespace-pre-wrap font-mono">{latest.rendered}</pre>
              </details>
            </>
          ) : (
            <p className="card text-sm text-muted">No evaluations yet.</p>
          )}
          {setup.evaluations.length > 1 && (
            <section className="card">
              <h3 className="mb-2 text-sm font-semibold">Evaluation history</h3>
              <ul className="space-y-1 text-sm">
                {setup.evaluations.map((e) => (
                  <li key={e.id} className="flex items-center gap-3"><ScoreBadge score={e.overallScore} label={e.overallLabel} size="sm" /><span className="text-xs text-muted">{fmtDateJst(e.createdAt)} · {e.strategyVersion}</span>{e.review && <span className="text-xs">{e.review.agree ? "✓ Agreed" : "✗ Corrected"}</span>}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
        <aside className="space-y-3">
          {setup.images.map((img) => (
            <figure key={img.id} className="card p-2">
              <a href={fileUrl(img.path)} target="_blank" rel="noreferrer"><img src={fileUrl(img.path)} alt="" className="w-full rounded" /></a>
              <figcaption className="mt-1 text-[11px] text-muted">{img.role === "EXEC" ? "Execution TF" : img.role === "HIGHER" ? "Higher TF" : "Supplementary"}</figcaption>
            </figure>
          ))}
          {setup.numericData && <pre className="card overflow-auto font-mono text-xs">{JSON.stringify(JSON.parse(setup.numericData), null, 2)}</pre>}
          {setup.notes && <div className="card text-sm whitespace-pre-line"><p className="label">Notes</p>{setup.notes}</div>}
        </aside>
      </div>
    </div>
  );
}
