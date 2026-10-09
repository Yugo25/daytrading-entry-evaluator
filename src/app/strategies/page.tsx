import Link from "next/link";
import { strategies } from "@/strategies";
import { strategyVersion } from "@/strategies/docs";

export default function StrategiesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Strategies (evaluation criteria)</h1>
      <p className="text-sm text-muted">The evaluator uses the strategy docs registered here as its sole criteria. The criteria are revised deliberately, by editing the docs (correcting an evaluation never changes the criteria).</p>
      <div className="grid gap-4 md:grid-cols-2">
        {strategies.map((s) => (
          <Link key={s.id} href={`/strategies/${s.id}`} className={`card block space-y-2 hover:border-accent ${s.enabled ? "" : "opacity-60"}`}>
            <div className="flex items-center justify-between"><h2 className="font-semibold">{s.name}</h2><span className={`rounded px-2 py-0.5 text-[11px] ${s.enabled ? "bg-emerald-500/15 text-emerald-600" : "bg-border text-muted"}`}>{s.enabled ? "Enabled" : "Coming soon"}</span></div>
            <p className="text-sm text-muted">{s.description}</p>
            <p className="text-xs text-muted">Execution TF: {s.execTimeframes.join(" / ")} · axes: {s.axes.length} · elements: {s.axes.reduce((n, a) => n + a.elements.length, 0)} · docs: {s.docs.length}{s.enabled && ` · ver ${strategyVersion(s)}`}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
