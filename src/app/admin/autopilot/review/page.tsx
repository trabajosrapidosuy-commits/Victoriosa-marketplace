import { AutopilotCandidateTable } from "@/components/autopilot/AutopilotCandidateTable";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { loadAutopilotWebSnapshot } from "@/services/autopilot-web-service";

export default async function AutopilotReviewPage() {
  const fallbackMessage = "Supabase Autopilot data unavailable in this environment";
  const { supabase } = await requireAdmin();
  let connectionMessage = "Supabase conectado para lectura admin-only.";
  const candidates = await listPersistentCandidates(supabase)
    .then((rows) => rows
      .filter((candidate) => candidate.review_status === "pending_admin_review" || candidate.review_status === "blocked_no_publish")
      .sort((left, right) => Number(right.total_score) - Number(left.total_score)))
    .catch(() => {
      connectionMessage = fallbackMessage;
      return [];
    });

  return (
    <main className="space-y-5">
      <section className="card">
        <h2 className="text-xl font-bold">Revision humana</h2>
        <p className="mt-2 text-sm text-gray-700">
          Cola privada para decidir aprobacion, rechazo o importacion a draft. Ningun producto se publica desde aqui.
        </p>
        <p className="mt-2 text-sm text-gray-700">{connectionMessage}</p>
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
