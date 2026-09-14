const colors: Record<number, string> = {
  5: "bg-emerald-600 text-white",
  4: "bg-emerald-500/80 text-white",
  3: "bg-amber-500 text-white",
  2: "bg-orange-600 text-white",
  1: "bg-red-600 text-white",
};

export function ScoreBadge({ score, label, size = "md" }: { score: number; label?: string; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "text-base px-3 py-1.5" : size === "sm" ? "text-[11px] px-1.5 py-0.5" : "text-xs px-2 py-1";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md font-semibold ${sz} ${colors[score] ?? "bg-border"}`}>
      <span className="font-mono">{score}/5</span>
      {label && <span className="font-normal">{label}</span>}
    </span>
  );
}

export function Mark({ mark }: { mark: string }) {
  const c = mark === "○" ? "text-emerald-600" : mark === "△" ? "text-amber-500" : mark === "×" ? "text-red-600" : "text-muted";
  return <span className={`font-bold ${c}`}>{mark}</span>;
}
