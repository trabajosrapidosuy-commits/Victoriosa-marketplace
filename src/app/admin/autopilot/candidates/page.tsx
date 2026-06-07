import { AutopilotCandidateTable } from "@/components/autopilot/AutopilotCandidateTable";
import type { AutopilotRecommendation } from "@/types/autopilot";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { loadAutopilotWebSnapshot } from "@/services/autopilot-web-service";

export default async function CandidatesPage({ searchParams }: { searchParams: Promise<{ status?: string; sort?: string; category?: string; provider?: string; minScore?: string; maxRisk?: string; recommendation?: string }> }) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const snapshot = await loadAutopilotWebSnapshot(supabase);
  const minScore = Number(params.minScore || 0);
  const maxRisk = params.maxRisk ? Number(params.maxRisk) : Number.POSITIVE_INFINITY;
  const candidates = snapshot.candidates
    .filter((candidate) => !params.status || candidate.status === params.status)
    .filter((candidate) => !params.category || candidate.category.toLowerCase().includes(params.category.toLowerCase()))
    .filter((candidate) => !params.provider || `${candidate.provider} ${candidate.sourceUrl ?? ""}`.toLowerCase().includes(params.provider.toLowerCase()))
    .filter((candidate) => !params.recommendation || candidate.recommendation === params.recommendation as AutopilotRecommendation)
    .filter((candidate) => candidate.totalScore >= minScore)
    .filter((candidate) => candidate.riskScore <= maxRisk)
    .sort((left, right) => {
      if (params.sort === "risk") return right.riskScore - left.riskScore;
      return right.totalScore - left.totalScore;
    });

  return (
    <main className="card overflow-x-auto">
      <h2 className="text-xl font-bold">Candidatos persistidos</h2>
      <p className="mt-2 text-sm">Ningun candidato puede publicarse sin revision humana.</p>
      <p className="mt-2 text-sm text-gray-700">
        Estado Supabase: <strong>{snapshot.connectionStatus === "connected" ? "CONNECTED" : "UNAVAILABLE"}</strong> · {snapshot.message}
      </p>
      <form className="mt-4 flex flex-wrap gap-2 text-sm">
        <select className="rounded border p-2" defaultValue={params.status ?? ""} name="status"><option value="">Todos los estados</option><option>pending_admin_review</option><option>approved_for_draft</option><option>rejected</option><option>imported_to_products</option><option>blocked_no_publish</option></select>
        <select className="rounded border p-2" defaultValue={params.recommendation ?? ""} name="recommendation"><option value="">Todas las recomendaciones</option><option value="approve_candidate">Aprobar candidato</option><option value="review">Revisar</option><option value="reject">Rechazar</option></select>
        <input className="rounded border p-2" defaultValue={params.category ?? ""} name="category" placeholder="Categoria" />
        <input className="rounded border p-2" defaultValue={params.provider ?? ""} name="provider" placeholder="Proveedor o fuente" />
        <input className="w-28 rounded border p-2" defaultValue={params.minScore ?? ""} min="0" max="100" name="minScore" placeholder="Score min" type="number" />
        <input className="w-28 rounded border p-2" defaultValue={params.maxRisk ?? ""} min="0" max="100" name="maxRisk" placeholder="Riesgo max" type="number" />
        <select className="rounded border p-2" defaultValue={params.sort ?? "score"} name="sort"><option value="score">Ordenar score</option><option value="risk">Ordenar riesgo</option></select>
        <button className="btn btn-secondary" type="submit">Aplicar filtros</button>
      </form>
      <div className="mt-4">
        <AutopilotCandidateTable
          candidates={candidates}
          emptyMessage={snapshot.connectionStatus === "unavailable"
            ? "Supabase Autopilot data unavailable in this environment"
            : "No hay candidates persistidos. Ejecuta Discovery para crear la primera cola."}
        />
      </div>
    </main>
  );
}
