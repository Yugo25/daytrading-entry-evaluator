import Link from "next/link";
import { strategies } from "@/strategies";
import { strategyVersion } from "@/strategies/docs";

export default function StrategiesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">手法(判定基準)</h1>
      <p className="text-sm text-muted">判定器はここに登録された手法ドキュメントを唯一の基準として使います。基準の改訂は意図的に、ドキュメントを編集して行います(判定結果の訂正では基準は変わりません)。</p>
      <div className="grid gap-4 md:grid-cols-2">
        {strategies.map((s) => (
          <Link key={s.id} href={`/strategies/${s.id}`} className={`card block space-y-2 hover:border-accent ${s.enabled ? "" : "opacity-60"}`}>
            <div className="flex items-center justify-between"><h2 className="font-semibold">{s.name}</h2><span className={`rounded px-2 py-0.5 text-[11px] ${s.enabled ? "bg-emerald-500/15 text-emerald-600" : "bg-border text-muted"}`}>{s.enabled ? "有効" : "準備中"}</span></div>
            <p className="text-sm text-muted">{s.description}</p>
            <p className="text-xs text-muted">執行足: {s.execTimeframes.join(" / ")} · 軸: {s.axes.length} · 要素: {s.axes.reduce((n, a) => n + a.elements.length, 0)} · ドキュメント: {s.docs.length}{s.enabled && ` · ver ${strategyVersion(s)}`}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
