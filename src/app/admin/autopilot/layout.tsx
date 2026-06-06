import { requireAdmin } from "@/lib/supabase/require-admin";
import { AutopilotSafetyBanner } from "@/components/autopilot/AutopilotSafetyBanner";

export const dynamic = "force-dynamic";

export default async function AutopilotLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="space-y-5">
      <section className="card">
        <span className="badge">AUTOPILOT_SANDBOX - revision humana obligatoria</span>
        <h1 className="mt-3 text-3xl font-bold">Victoriosa Autopilot</h1>
        <p className="mt-2 text-sm text-gray-700">
          Descubre, puntua y tasa oportunidades comerciales persistidas. No publica, no compra y no activa proveedores automaticamente.
        </p>
      </section>
      <AutopilotSafetyBanner />
      {children}
    </div>
  );
}
