import type { RiskAssessment } from "./types";

export type CoreCandidateStatus = "discovered" | "shortlisted" | "needs_review" | "rejected" | "approved" | "imported_draft" | "failed";

export function initialCandidateStatus(risk: RiskAssessment): CoreCandidateStatus {
  if (risk.recommendedAction === "reject") return "rejected";
  return "needs_review";
}
