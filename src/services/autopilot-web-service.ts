import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { listPersistentCandidates, listPersistentDiscoveryRuns } from "./autopilot-persistence-service";
import type { AutopilotRecommendation } from "@/types/autopilot";
import { kbeautyAutopilotSeed } from "../../data/kbeautyAutopilotSeed.js";

export interface AutopilotWebCandidate {
  id: string;
  title: string;
  category: string;
  provider: string;
  sourceUrl?: string;
  status: string;
  recommendation: AutopilotRecommendation;
  complianceDecision: AutopilotRecommendation;
  blockers: string[];
  warnings: string[];
  totalScore: number;
  riskScore: number;
  createdAt?: string;
  updatedAt?: string;
  draftSafetyLabel: "draft + needs_review";
}

export interface AutopilotWebSnapshot {
  connectionStatus: "connected" | "unavailable";
  message: string;
  usesSupabaseData: boolean;
  candidates: AutopilotWebCandidate[];
  runs: Record<string, unknown>[];
  kbeautyPersistenceState: "applied" | "not_applied_yet" | "unavailable";
  persistedBrandCount: number;
  fallbackBrandNames: string[];
}

interface SnapshotLoaders {
  loadCandidates?: () => Promise<Record<string, unknown>[]>;
  loadRuns?: () => Promise<Record<string, unknown>[]>;
}

export async function loadAutopilotWebSnapshot(
  supabase: SupabaseClient,
  loaders: SnapshotLoaders = {},
): Promise<AutopilotWebSnapshot> {
  const loadCandidates = loaders.loadCandidates ?? (() => listPersistentCandidates(supabase) as Promise<Record<string, unknown>[]>);
  const loadRuns = loaders.loadRuns ?? (() => listPersistentDiscoveryRuns(supabase) as Promise<Record<string, unknown>[]>);

  try {
    const [candidates, runs, brandState] = await Promise.all([loadCandidates(), loadRuns(), loadBrandPersistenceState(supabase)]);
    return {
      connectionStatus: "connected",
      message: brandState.state === "applied"
        ? "Supabase connected"
        : "Supabase connected. Persistence not applied yet for K-beauty brand tables.",
      usesSupabaseData: true,
      candidates: candidates.map(mapAutopilotWebCandidate),
      runs,
      kbeautyPersistenceState: brandState.state,
      persistedBrandCount: brandState.count,
      fallbackBrandNames: kbeautyAutopilotSeed.brands.map((brand) => brand.name),
    };
  } catch {
    return {
      connectionStatus: "unavailable",
      message: "Supabase Autopilot data unavailable in this environment",
      usesSupabaseData: false,
      candidates: [],
      runs: [],
      kbeautyPersistenceState: "unavailable",
      persistedBrandCount: 0,
      fallbackBrandNames: kbeautyAutopilotSeed.brands.map((brand) => brand.name),
    };
  }
}

export function mapAutopilotWebCandidate(row: Record<string, unknown>): AutopilotWebCandidate {
  const scoring = asRecord(row.scoring);
  const compliance = asRecord(scoring.complianceDecision);
  return {
    id: String(row.id ?? ""),
    title: String(row.title ?? "Candidate"),
    category: String(row.category ?? "Sin categoria"),
    provider: String(row.provider ?? row.supplier_name ?? "-"),
    sourceUrl: stringOrUndefined(row.source_url),
    status: String(row.review_status ?? row.status ?? "pending_admin_review"),
    recommendation: getRecommendation(row),
    complianceDecision: getRecommendation(compliance),
    blockers: toStringList(scoring.blockers),
    warnings: toStringList(scoring.warnings),
    totalScore: Number(row.total_score ?? scoring.total ?? 0),
    riskScore: Number(row.risk_score ?? scoring.riskScore ?? 0),
    createdAt: stringOrUndefined(row.created_at),
    updatedAt: stringOrUndefined(row.updated_at),
    draftSafetyLabel: "draft + needs_review",
  };
}

export function getRecommendation(row: Record<string, unknown>): AutopilotRecommendation {
  const scoring = asRecord(row.scoring);
  const breakdown = asRecord(row.score_breakdown);
  const value = row.recommendation ?? scoring.recommendation ?? breakdown.recommendation;
  return value === "approve_candidate" || value === "reject" || value === "review"
    ? value
    : Number(row.risk_score ?? scoring.riskScore ?? 0) >= 70
      ? "reject"
      : "review";
}

function toStringList(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

function stringOrUndefined(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

async function loadBrandPersistenceState(supabase: SupabaseClient) {
  const { count, error } = await supabase
    .from("autopilot_brand_candidates")
    .select("id", { count: "exact", head: true });

  if (error) {
    return { state: "not_applied_yet" as const, count: 0 };
  }

  return { state: "applied" as const, count: Number(count ?? 0) };
}
