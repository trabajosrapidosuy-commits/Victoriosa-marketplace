import { AutopilotCandidateTable } from "@/components/autopilot/AutopilotCandidateTable";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { loadAutopilotWebSnapshot } from "@/services/autopilot-web-service";

export default async function AutopilotReviewPage() {
  const { supabase } = await requireAdmin();
  const snapshot = await loadAutopilotWebSnapshot(supabase);
  const candidates = snapshot.candidates
    .filter((candidate) => candidate.status === "pending_admin_review" || candidate.status === "blocked_no_publish")
    .sort((left, right) => right.totalScore - left.totalScore);

  return (
    <main className="space-y-5">
      <section className="card">
        <h2 className="text-xl font-bold">Revision humana</h2>
        <p className="mt-2 text-sm text-gray-700">
          Cola privada para decidir aprobacion, rechazo o importacion a draft. Ningun producto se publica desde aqui.
        </p>
        <p className="mt-2 text-sm text-gray-700">
          Estado Supabase: <strong>{snapshot.connectionStatus === "connected" ? "CONNECTED" : "UNAVAILABLE"}</strong> · {snapshot.message}
        </p>
      </section>
      <section className="card">
        <AutopilotCandidateTable
          candidates={candidates}
          emptyMessage={snapshot.connectionStatus === "unavailable"
            ? "Supabase Autopilot data unavailable in this environment"
            : "No hay candidatos pendientes de decision humana."}
        />
      </section>
    </main>
  );
}
