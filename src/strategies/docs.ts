import "server-only";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import type { StrategyDefinition } from "./types";

const ROOT = path.join(process.cwd(), "src", "strategies");

export function readStrategyDocs(strategy: StrategyDefinition) {
  return strategy.docs.map((d) => ({
    ...d,
    content: fs.readFileSync(path.join(ROOT, strategy.id, d.path), "utf8"),
  }));
}

/** 手法ドキュメント全体のハッシュ。どの基準で判定されたかを Evaluation に記録する */
export function strategyVersion(strategy: StrategyDefinition) {
  const h = createHash("sha256");
  h.update(JSON.stringify({ axes: strategy.axes, observations: strategy.observations, verdicts: strategy.verdicts }));
  for (const d of readStrategyDocs(strategy)) h.update(d.content);
  return h.digest("hex").slice(0, 12);
}
