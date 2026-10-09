import { strategies } from "@/strategies";

export type TradeFormValues = {
  date?: Date; pair?: string; strategyId?: string; execTf?: string; holdTime?: string | null;
  lineGrade?: string | null; aoiGrade?: string | null; outcome?: string; riskPct?: number | null; rrr?: number | null;
  resultPct?: number | null; market?: string | null; ruleCompliance?: boolean; violationContent?: string | null;
  violationMotive?: string | null; analysis?: string | null; psychology?: string | null;
};

function toLocalJst(d?: Date) {
  if (!d) return "";
  const j = new Date(d.getTime() + 9 * 3600 * 1000);
  return j.toISOString().slice(0, 16);
}

const grades = ["", "S", "A", "B", "None"];

export function TradeForm({ action, values = {}, setupId, submitLabel = "Save" }: { action: (fd: FormData) => Promise<void>; values?: TradeFormValues; setupId?: string | null; submitLabel?: string }) {
  const v = values;
  return (
    <form action={action} className="space-y-4">
      {setupId && <input type="hidden" name="setupId" value={setupId} />}
      <div className="card grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="col-span-2"><label className="label">Date &amp; time (JST)</label><input className="input" type="datetime-local" name="date" defaultValue={toLocalJst(v.date)} required /></div>
        <div><label className="label">Pair</label><input className="input font-mono uppercase" name="pair" defaultValue={v.pair ?? ""} required /></div>
        <div><label className="label">Hold time</label><input className="input" name="holdTime" placeholder="4h / 1d10h" defaultValue={v.holdTime ?? ""} /></div>
        <div><label className="label">Type (strategy)</label>
          <select className="input" name="strategyId" defaultValue={v.strategyId ?? "ema200"}>{strategies.map((s) => <option key={s.id} value={s.id}>{s.shortName}</option>)}</select></div>
        <div><label className="label">TF</label>
          <select className="input" name="execTf" defaultValue={v.execTf ?? "5m"}><option>5m</option><option>15m</option><option>1h</option><option>4h</option></select></div>
        <div><label className="label">Line</label>
          <select className="input" name="lineGrade" defaultValue={v.lineGrade ?? ""}>{grades.map((g) => <option key={g} value={g}>{g || "—"}</option>)}</select></div>
        <div><label className="label">AOI</label>
          <select className="input" name="aoiGrade" defaultValue={v.aoiGrade ?? ""}>{grades.map((g) => <option key={g} value={g}>{g || "—"}</option>)}</select></div>
        <div><label className="label">Outcome</label>
          <select className="input" name="outcome" defaultValue={v.outcome ?? "WIN"}><option value="WIN">Win</option><option value="BE">BE</option><option value="LOSS">Loss</option></select></div>
        <div><label className="label">Risk %</label><input className="input" name="riskPct" inputMode="decimal" placeholder="0.5" defaultValue={v.riskPct ?? ""} /></div>
        <div><label className="label">RRR</label><input className="input" name="rrr" inputMode="decimal" placeholder="1.5" defaultValue={v.rrr ?? ""} /></div>
        <div><label className="label">Result %</label><input className="input" name="resultPct" inputMode="decimal" placeholder="-0.49" defaultValue={v.resultPct ?? ""} /></div>
        <div><label className="label">Market</label>
          <select className="input" name="market" defaultValue={v.market ?? ""}><option value="">Auto (from time)</option><option>Tokyo</option><option>London</option><option>NY</option></select></div>
      </div>
      <div className="card grid gap-3 sm:grid-cols-3">
        <div><label className="label">Rule compliance</label>
          <select className="input" name="ruleCompliance" defaultValue={v.ruleCompliance === false ? "no" : "yes"}><option value="yes">Yes</option><option value="no">No</option></select></div>
        <div><label className="label">Violation</label><input className="input" name="violationContent" placeholder="Entry without enough basis" defaultValue={v.violationContent ?? ""} /></div>
        <div><label className="label">Violation motive</label><input className="input" name="violationMotive" placeholder="Overconfidence" defaultValue={v.violationMotive ?? ""} /></div>
      </div>
      <div className="card grid gap-3 md:grid-cols-2">
        <div><label className="label">Analysis</label><textarea className="input" name="analysis" rows={5} defaultValue={v.analysis ?? ""} /></div>
        <div><label className="label">Psychology</label><textarea className="input" name="psychology" rows={5} defaultValue={v.psychology ?? ""} /></div>
      </div>
      <button className="btn-primary">{submitLabel}</button>
    </form>
  );
}
