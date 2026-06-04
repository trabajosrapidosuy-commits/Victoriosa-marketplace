import { requireAdmin } from "@/lib/supabase/require-admin";
import { AUTOPILOT_BLOCKED_CATEGORIES, AUTOPILOT_PRIORITY_CATEGORIES } from "@/lib/autopilot/admin/control-center";
import { AUTOPILOT_MODE_FLAGS } from "@/lib/autopilot/config";

export default async function AutopilotSettingsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("autopilot_settings").select("*").eq("id", true).maybeSingle();
  return (
    <main className="space-y-5">
      <section className="card">
        <h2 className="text-xl font-bold">Reglas de Autopilot</h2>
        <p className="mt-2 text-sm">Pantalla read-only en esta fase. Nunca guardar secrets desde UI.</p>
        <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
          <Info label="Modo" value={data?.mode ?? AUTOPILOT_MODE_FLAGS.currentMode} />
          <Info label="Markup base" value={`${data?.base_markup_percent ?? 65}%`} />
          <Info label="Margen minimo" value={`${data?.minimum_margin_percent ?? 35}%`} />
          <Info label="Pais objetivo" value={data?.target_country ?? "UY"} />
          <Info label="Moneda" value={data?.currency ?? "USD"} />
          <Info label="Nicho" value={data?.primary_niche ?? "beauty"} />
          <Info label="Proveedor live" value={AUTOPILOT_MODE_FLAGS.liveProviders} />
          <Info label="Publicacion automatica" value={AUTOPILOT_MODE_FLAGS.autoPublish} />
          <Info label="Revision humana" value={AUTOPILOT_MODE_FLAGS.humanReview} />
        </dl>
      </section>
      <section className="grid gap-5 md:grid-cols-2">
        <ListCard title="Categorias prioritarias" values={AUTOPILOT_PRIORITY_CATEGORIES} />
        <ListCard title="Categorias bloqueadas" values={AUTOPILOT_BLOCKED_CATEGORIES} />
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="font-bold">{label}</dt><dd>{value}</dd></div>;
}

function ListCard({ title, values }: { title: string; values: readonly string[] }) {
  return <div className="card"><h3 className="font-bold">{title}</h3><ul className="mt-3 list-disc pl-5 text-sm">{values.map((value) => <li key={value}>{value}</li>)}</ul></div>;
}
