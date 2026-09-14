import { enabledStrategies } from "@/strategies";
import { EvaluateForm } from "./EvaluateForm";

export const maxDuration = 300;

export default function EvaluatePage() {
  const strategies = enabledStrategies().map(({ id, name, execTimeframes, higherTimeframes }) => ({ id, name, execTimeframes, higherTimeframes }));
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">セットアップ判定</h1>
      <EvaluateForm strategies={strategies} />
    </div>
  );
}
