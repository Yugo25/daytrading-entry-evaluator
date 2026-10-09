import { prisma } from "@/lib/db";
import { TradeForm } from "@/components/TradeForm";
import { createTrade } from "../actions";

export default async function NewTradePage({ searchParams }: PageProps<"/journal/new">) {
  const sp = await searchParams;
  const setupId = typeof sp.setupId === "string" ? sp.setupId : null;
  const setup = setupId ? await prisma.setup.findUnique({ where: { id: setupId } }) : null;
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Log a Trade</h1>
      {setup && <p className="text-sm text-muted">Linked to evaluation {setup.pair} {setup.execTf}</p>}
      <TradeForm action={createTrade} setupId={setup?.id} values={setup ? { pair: setup.pair, strategyId: setup.strategyId, execTf: setup.execTf, date: new Date() } : { date: new Date() }} submitLabel="Save trade" />
    </div>
  );
}
