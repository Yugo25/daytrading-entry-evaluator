import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { strategies } from "@/strategies";
import { readStrategyDocs, strategyVersion } from "@/strategies/docs";
import { Mark } from "@/components/ScoreBadge";

export default async function StrategyPage({ params }: PageProps<"/strategies/[id]">) {
  const { id } = await params;
  const s = strategies.find((x) => x.id === id);
  if (!s) notFound();
  const docs = s.enabled ? readStrategyDocs(s) : [];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{s.name}</h1>
        <p className="text-sm text-muted">{s.description}</p>
        {s.enabled && <p className="text-xs text-muted">基準バージョン: {strategyVersion(s)}(ドキュメントを編集すると変わり、以後の判定に記録されます)</p>}
      </div>

      {s.axes.length > 0 && (
        <section className="grid gap-4 md:grid-cols-2">
          {s.axes.map((a, i) => (
            <div key={a.key} className="card">
              <h2 className="mb-2 text-sm font-semibold">軸{i + 1}: {a.label} <span className="font-normal text-muted">— {a.subtitle}</span></h2>
              <table className="w-full text-xs"><thead className="text-left text-muted"><tr><th className="py-1">要素</th><th><Mark mark="○" /> の基準</th><th><Mark mark="×" /> の典型</th></tr></thead>
                <tbody>{a.elements.map((e) => <tr key={e.key} className="border-t border-border align-top"><td className="py-1.5 pr-2 whitespace-nowrap"><span className="font-mono">{e.key}</span> {e.label}{e.core && <span className="ml-1 text-[10px] text-muted">中核</span>}</td><td className="py-1.5 pr-2">{e.pass}</td><td className="py-1.5">{e.fail}</td></tr>)}</tbody>
              </table>
            </div>
          ))}
        </section>
      )}

      {s.verdicts.length > 0 && (
        <section className="card">
          <h2 className="mb-2 text-sm font-semibold">総合判定</h2>
          <table className="w-full text-sm"><tbody>{s.verdicts.map((v) => <tr key={v.score} className="border-t border-border"><td className="w-10 py-1 font-mono">{v.score}</td><td className="w-40 py-1">{v.label}</td><td className="py-1 text-muted">{v.meaning}</td></tr>)}</tbody></table>
          {s.specialRules.length > 0 && <div className="mt-3 space-y-1 text-xs"><p className="font-semibold">特則(ハードキャップ)</p>{s.specialRules.map((r) => <p key={r.key}><span className="font-medium">{r.label}</span>: <span className="text-muted">{r.description}</span></p>)}</div>}
        </section>
      )}

      {docs.map((d) => (
        <details key={d.path} className="card" open={d.role === "skill"}>
          <summary className="cursor-pointer text-sm font-semibold">{d.name} <span className="font-mono text-xs text-muted">src/strategies/{s.id}/{d.path}</span></summary>
          <div className="prose-eval mt-3 text-sm"><Markdown remarkPlugins={[remarkGfm]}>{d.content}</Markdown></div>
        </details>
      ))}
      {!s.enabled && <p className="card text-sm text-muted">この手法はまだ準備中です。手法ドキュメントと判定スキルを src/strategies/{s.id}/ に配置し、index.ts の observations / axes / verdicts / docs を定義して enabled: true にすると判定で選択できます。</p>}
    </div>
  );
}
