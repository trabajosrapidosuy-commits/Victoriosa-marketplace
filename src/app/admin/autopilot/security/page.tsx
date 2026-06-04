import { AUTOPILOT_MODE_FLAGS } from "@/lib/autopilot/config";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { listPersistentCandidates } from "@/services/autopilot-persistence-service";

export default async function AutopilotSecurityPage() {
  const { supabase } = await requireAdmin();
  const candidates = await listPersistentCandidates(supabase);
  const blocked = candidates.filter((candidate) => candidate.review_status === "blocked_no_publish" || Number(candidate.risk_score ?? 0) >= 70).length;
  const imported = candidates.filter((candidate) => candidate.review_status === "imported_to_products").length;

  return (
    <main className="space-y-5">
      <section className="card">
        <h2 className="text-xl font-bold">Seguridad y limites operativos</h2>
        <p className="mt-2 text-sm text-gray-700">
          Vista privada para revisar RLS, bloqueo de publicacion automatica y superficie admin-only.
        </p>
        <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-3">
          <Info label="RLS" value={AUTOPILOT_MODE_FLAGS.rls} />
          <Info label="Publicacion automatica" value={AUTOPILOT_MODE_FLAGS.autoPublish} />
          <Info label="Proveedores live" value={AUTOPILOT_MODE_FLAGS.liveProviders} />
          <Info label="Scraping no autorizado" value={AUTOPILOT_MODE_FLAGS.unauthorizedScraping} />
          <Info label="Revision humana obligatoria" value={AUTOPILOT_MODE_FLAGS.humanReview} />
          <Info label="Modo actual" value={AUTOPILOT_MODE_FLAGS.currentMode} />
        </dl>
      </section>
      <section className="grid gap-5 md:grid-cols-3">
        <Metric label="Candidatos bloqueados" value={blocked} />
        <Metric label="Drafts importados" value={imported} />
        <Metric label="Fixtures persistentes" value={0} />
      </section>
      <section className="card">
        <h3 className="font-bold">Garantias activas</h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
          <li>Anon no puede leer tablas internas Autopilot.</li>
          <li>Customer no puede entrar en rutas `/admin` ni `/owner`.</li>
          <li>Solo `admin` y `marketplace_admin` pasan `requireAdmin()`.</li>
          <li>Importar a draft conserva `publication_status=draft` y `compliance_status=needs_review`.</li>
          <li>Autopilot no publica productos automaticamente y no usa proveedores live.</li>
        </ul>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-bold uppercase tracking-[0.14em] text-[#8b7165]">{label}</dt><dd className="mt-1 text-sm text-[#3a2a27]">{value}</dd></div>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="card"><p className="text-sm text-gray-600">{label}</p><p className="mt-1 text-3xl font-bold">{value}</p></div>;
}
