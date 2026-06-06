import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { AUTOPILOT_MODE_FLAGS } from "@/lib/autopilot/config";
import { listPersistentCandidates, listPersistentDiscoveryRuns } from "@/services/autopilot-persistence-service";
import { listAutopilotConnectors } from "@/services/autopilot-service";
import { loadAutopilotWebSnapshot } from "@/services/autopilot-web-service";

export default async function AutopilotPage() {
  const supabaseFallbackMessage = "Supabase Autopilot data unavailable in this environment";
  const { supabase } = await requireAdmin();
  const [candidates, runs, snapshot] = await Promise.all([
    listPersistentCandidates(supabase),
    listPersistentDiscoveryRuns(supabase),
    loadAutopilotWebSnapshot(supabase),
  ]);
  const connectors = listAutopilotConnectors();
  const reviewCount = candidates.filter((candidate) => candidate.review_status === "pending_admin_review").length;
  const approvedCount = candidates.filter((candidate) => candidate.review_status === "approved_for_draft").length;
  const rejectedCount = candidates.filter((candidate) => candidate.review_status === "rejected").length;
  const importedCount = candidates.filter((candidate) => candidate.review_status === "imported_to_products").length;
  const blockedCount = candidates.filter((candidate) => candidate.review_status === "blocked_no_publish" || Number(candidate.risk_score ?? 0) >= 70).length;
  const averageScore = Math.round(candidates.reduce((sum, candidate) => sum + Number(candidate.total_score), 0) / Math.max(candidates.length, 1));
  const lastRun = runs[0];

  return (
    <main className="space-y-5">
      <section className="grid gap-4 md:grid-cols-4 xl:grid-cols-6">
        <Metric label="Candidatos descubiertos" value={candidates.length} />
        <Metric label="Pendientes de revision" value={reviewCount} />
        <Metric label="Aprobados" value={approvedCount} />
        <Metric label="Rechazados" value={rejectedCount} />
        <Metric label="Importados a draft" value={importedCount} />
        <Metric label="Bloqueados por riesgo" value={blockedCount} />
        <Metric label="Score promedio" value={averageScore} />
        <Metric label="Conectores declarados" value={connectors.length} />
      </section>
      <section className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <div className="card">
          <h2 className="text-xl font-bold">Estado operativo</h2>
          <p className="mt-2 text-sm">
            Estado Supabase: <strong>{snapshot.connectionStatus === "connected" ? "CONNECTED" : "UNAVAILABLE"}</strong>
          </p>
          <p className="mt-2 text-sm text-gray-700">
            {snapshot.connectionStatus === "connected" ? snapshot.message : supabaseFallbackMessage}
          </p>
          <p className="mt-2 text-sm text-gray-700">
            K-beauty persistence:{" "}
            <strong>
              {snapshot.kbeautyPersistenceState === "applied"
                ? "APPLIED"
                : snapshot.kbeautyPersistenceState === "not_applied_yet"
                  ? "Persistence not applied yet"
                  : "UNAVAILABLE"}
            </strong>{" "}
            · Marcas persistidas: <strong>{snapshot.persistedBrandCount}</strong>
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            <li>Discovery mock, manual y csv-json con scoring y persistencia admin-only disponibles.</li>
            <li>Todo candidato entra en review-only y queda sujeto a decision humana.</li>
            <li>Conectores reales informan needs_credentials hasta tener acceso seguro y terminos validados.</li>
            <li>Email marketing, publicacion y acciones con proveedores live permanecen deshabilitados.</li>
            <li>K-beauty research queda preparado solo para shortlist, draft y supplier validation.</li>
          </ul>
          {snapshot.kbeautyPersistenceState !== "applied" ? (
            <p className="mt-3 text-sm text-[#6c4d34]">
              Fallback local activo para marcas K-beauty: {snapshot.fallbackBrandNames.join(", ")}.
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="btn" href="/admin/autopilot/discovery">Abrir discovery</Link>
            <Link className="btn btn-secondary" href="/admin/autopilot/candidates">Revisar candidatos</Link>
            <Link className="btn btn-secondary" href="/admin/autopilot/drafts">Ver drafts</Link>
          </div>
        </div>
        <div className="card">
          <h2 className="text-xl font-bold">Controles de seguridad</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <Info label="Publicacion automatica" value={AUTOPILOT_MODE_FLAGS.autoPublish} />
            <Info label="Proveedores live" value={AUTOPILOT_MODE_FLAGS.liveProviders} />
            <Info label="Revision humana obligatoria" value={AUTOPILOT_MODE_FLAGS.humanReview} />
            <Info label="RLS" value={AUTOPILOT_MODE_FLAGS.rls} />
            <Info label="Ultimo run" value={lastRun ? new Date(lastRun.created_at).toLocaleString() : "Sin ejecuciones"} />
            <Info label="Resultado ultimo run" value={lastRun?.status ?? "Sin datos"} />
          </dl>
          <p className="mt-4 text-sm text-[#6c4d34]">
            K-beauty: shortlist y carga review-only preparadas localmente. Ninguna marca queda marcada como representante oficial en esta fase.
          </p>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="card"><p className="text-sm text-gray-600">{label}</p><p className="mt-1 text-3xl font-bold">{value}</p></div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-bold uppercase tracking-[0.14em] text-[#8b7165]">{label}</dt><dd className="mt-1 text-sm text-[#3a2a27]">{value}</dd></div>;
}
