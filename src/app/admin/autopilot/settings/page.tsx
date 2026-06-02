import { requireAdmin } from "@/lib/supabase/require-admin";

export default async function AutopilotSettingsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("autopilot_settings").select("*").eq("id", true).maybeSingle();
  return <main className="card"><h2 className="text-xl font-bold">Settings supplier intelligence</h2><p className="mt-2 text-sm">Solo parametros operativos. Nunca guardar secrets desde UI.</p><dl className="mt-4 grid gap-3 text-sm md:grid-cols-3"><Info label="Modo" value={data?.mode ?? "mock"} /><Info label="Markup base" value={`${data?.base_markup_percent ?? 65}%`} /><Info label="Margen minimo" value={`${data?.minimum_margin_percent ?? 35}%`} /><Info label="Pais objetivo" value={data?.target_country ?? "UY"} /><Info label="Moneda" value={data?.currency ?? "USD"} /><Info label="Nicho" value={data?.primary_niche ?? "beauty"} /></dl></main>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="font-bold">{label}</dt><dd>{value}</dd></div>;
}
