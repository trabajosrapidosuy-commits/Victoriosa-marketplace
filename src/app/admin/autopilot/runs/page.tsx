import { requireAdmin } from "@/lib/supabase/require-admin";
import { listPersistentDiscoveryRuns } from "@/services/autopilot-persistence-service";

export default async function AutopilotRunsPage() {
  const { supabase } = await requireAdmin();
  const runs = await listPersistentDiscoveryRuns(supabase);
  return <main className="card"><h2 className="text-xl font-bold">Discovery runs</h2><ul className="mt-4 space-y-2 text-sm">{runs.map((run) => <li className="border-b pb-2" key={run.id}><strong>{run.status}</strong> - {run.query || "sin query"} - {new Date(run.created_at).toLocaleString()}</li>)}{runs.length === 0 && <li>No hay runs registrados.</li>}</ul></main>;
}
