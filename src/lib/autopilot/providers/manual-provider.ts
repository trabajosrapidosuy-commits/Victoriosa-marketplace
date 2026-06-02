import { normalizeManualProduct } from "../core/normalize";
import { scoreCandidate } from "../core/scoring";

export function createManualCandidate(input: unknown) {
  const product = normalizeManualProduct(input);
  return { product, score: scoreCandidate(product), status: "needs_review" as const };
}
