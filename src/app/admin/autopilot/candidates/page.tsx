import { AutopilotCandidateTable } from "@/components/autopilot/AutopilotCandidateTable";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { listPersistentCandidates } from "@/services/autopilot-persistence-service";

export default async function CandidatesPage({ searchParams }: { searchParams: Promise<{ status?: string; sort?: string; category?: string; provider?: string; minScore?: string; maxRisk?: string; recommendation?: string }> }) {
  const fallbackMessage = "Supabase Autopilot data unavailable in this environment";
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const minScore = Number(params.minScore || 0);
  const maxRisk = params.maxRisk ? Number(params.maxRisk) : Number.POSITIVE_INFINITY;
  let connectionMessage = "Supabase conectado para lectura admin-only.";
  const candidates = await listPersistentCandidates(supabase)
    .then((rows) => rows
      .filter((candidate) => !params.status || candidate.review_status === params.status)
      .filter((candidate) => !params.category || String(candidate.category ?? "").toLowerCase().includes(params.category.toLowerCase()))
      .filter((candidate) => !params.provider || String(candidate.provider ?? candidate.supplier_name ?? "").toLowerCase().includes(params.provider.toLowerCase()))
      .filter((candidate) => !params.recommendation || getRecommendation(candidate) === params.recommendation)
      .filter((candidate) => Number(candidate.total_score) >= minScore)
      .filter((candidate) => Number(candidate.risk_score ?? 0) <= maxRisk)
      .sort((left, right) => {
        if (params.sort === "margin") return Number(right.margin_percent) - Number(left.margin_percent);
        if (params.sort === "risk") return Number(right.risk_score ?? 0) - Number(left.risk_score ?? 0);
        if (params.sort === "shipping") return Number(right.logistics_score ?? 0) - Number(left.logistics_score ?? 0);
        return Number(right.total_score) - Number(left.total_score);
      }))
    .catch(() => {
      connectionMessage = fallbackMessage;
      return [];
    });
  return (
    <main className="card overflow-x-auto">
      <h2 className="text-xl font-bold">Candidatos persistidos</h2>
      <p className="mt-2 text-sm">Ningun candidato puede publicarse sin revision humana.</p>
      <p className="mt-2 text-sm text-gray-700">{connectionMessage}</p>
      <form className="mt-4 flex flex-wrap gap-2 text-sm">
        <select className="rounded border p-2" defaultValue={params.status ?? ""} name="status"><option value="">Todos los estados</option><option>pending_admin_review</option><option>approved_for_draft</option><option>rejected</option><option>imported_to_products</option></select>
        <select className="rounded border p-2" defaultValue={params.recommendation ?? ""} name="recommendation"><option value="">Todas las recomendaciones</option><option value="approve_candidate">Aprobar candidato</option><option value="review">Revisar</option><option value="reject">Rechazar</option></select>
        <input className="rounded border p-2" defaultValue={params.category ?? ""} name="category" placeholder="Categoria" />
        <input className="rounded border p-2" defaultValue={params.provider ?? ""} name="provider" placeholder="Proveedor" />
        <input className="w-28 rounded border p-2" defaultValue={params.minScore ?? ""} min="0" max="100" name="minScore" placeholder="Score min" type="number" />
        <input className="w-28 rounded border p-2" defaultValue={params.maxRisk ?? ""} min="0" max="100" name="maxRisk" placeholder="Riesgo max" type="number" />
        <select className="rounded border p-2" defaultValue={params.sort ?? "score"} name="sort"><option value="score">Ordenar score</option><option value="margin">Ordenar margen</option><option value="risk">Ordenar riesgo</option><option value="shipping">Ordenar envio</option></select>
        <button className="btn btn-secondary" type="submit">Aplicar filtros</button>
      </form>
      <div className="mt-4">
        <AutopilotCandidateTable
          candidates={candidates}
          emptyMessage="No hay candidatos persistidos. Ejecuta Discovery para crear la primera cola."
        />
      </div>
    </main>
  );
}

function getRecommendation(candidate: Record<string, unknown>) {
  const scoring = candidate.scoring && typeof candidate.scoring === "object" && !Array.isArray(candidate.scoring) ? candidate.scoring as Record<string, unknown> : {};
  const breakdown = candidate.score_breakdown && typeof candidate.score_breakdown === "object" && !Array.isArray(candidate.score_breakdown) ? candidate.score_breakdown as Record<string, unknown> : {};
  const value = scoring.recommendation ?? breakdown.recommendation;
  return value === "approve_candidate" || value === "reject" || value === "review" ? value : Number(candidate.risk_score ?? 0) >= 70 ? "reject" : "review";
}
