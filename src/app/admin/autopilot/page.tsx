import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { listPersistentCandidates, listPersistentDiscoveryRuns } from "@/services/autopilot-persistence-service";
import { listAutopilotConnectors } from "@/services/autopilot-service";

export default async function AutopilotPage() {
  const { supabase } = await requireAdmin();
  const [candidates, runs] = await Promise.all([listPersistentCandidates(supabase), listPersistentDiscoveryRuns(supabase)]);
  const connectors = listAutopilotConnectors();
  const reviewCount = candidates.filter((candidate) => candidate.review_status === "pending_admin_review").length;
  const averageScore = Math.round(candidates.reduce((sum, candidate) => sum + Number(candidate.total_score), 0) / Math.max(candidates.length, 1));

  return (
    <main className="space-y-5">
      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Conectores declarados" value={connectors.length} />
        <Metric label="Discovery runs" value={runs.length} />
        <Metric label="Pendientes de revision" value={reviewCount} />
        <Metric label="Score promedio sandbox" value={averageScore} />
      </section>
      <section className="card">
        <h2 className="text-xl font-bold">Estado operativo</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
          <li>Discovery mock, scoring y persistencia admin-only disponibles.</li>
          <li>CSV/JSON queda preparado como entrada controlada.</li>
          <li>Conectores reales informan needs_credentials hasta tener acceso seguro y terminos validados.</li>
          <li>Email marketing y publicacion masiva permanecen deshabilitados: requieren opt-in, proveedor aprobado y revision humana.</li>
        </ul>
        <div className="mt-4 flex gap-2">
          <Link className="btn" href="/admin/autopilot/discovery">Abrir discovery</Link>
          <Link className="btn btn-secondary" href="/admin/autopilot/candidates">Revisar candidatos</Link>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="card"><p className="text-sm text-gray-600">{label}</p><p className="mt-1 text-3xl font-bold">{value}</p></div>;
}
