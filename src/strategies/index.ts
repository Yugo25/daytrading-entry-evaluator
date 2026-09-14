import { ema200 } from "./ema200";
import { ema20 } from "./ema20";
import type { StrategyDefinition } from "./types";

export const strategies: StrategyDefinition[] = [ema200, ema20];

export function getStrategy(id: string): StrategyDefinition {
  const s = strategies.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown strategy: ${id}`);
  return s;
}

export function enabledStrategies() {
  return strategies.filter((s) => s.enabled);
}

export function strategyName(id: string) {
  return strategies.find((s) => s.id === id)?.shortName ?? id;
}

export type { StrategyDefinition, Mark } from "./types";
