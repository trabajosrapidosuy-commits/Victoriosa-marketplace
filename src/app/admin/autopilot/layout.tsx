import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/require-admin";

const links = [
  ["/admin/autopilot", "Resumen"],
  ["/admin/autopilot/discovery", "Discovery"],
  ["/admin/autopilot/imports", "Carga manual"],
  ["/admin/autopilot/candidates", "Candidatos"],
  ["/admin/autopilot/runs", "Runs"],
  ["/admin/autopilot/settings", "Settings"],
  ["/admin/autopilot/connectors", "Conectores"],
];

export const dynamic = "force-dynamic";

export default async function AutopilotLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="space-y-5">
      <section className="card">
        <span className="badge">AUTOPILOT_SANDBOX - revision humana obligatoria</span>
        <h1 className="mt-3 text-3xl font-bold">Victoriosa Product Autopilot</h1>
        <p className="mt-2 text-sm text-gray-700">
          Descubre, puntua y tasa oportunidades comerciales persistidas. No publica, compra ni envia campanas automaticamente.
        </p>
        <nav className="mt-4 flex flex-wrap gap-2">
          {links.map(([href, label]) => (
            <Link className="btn btn-secondary" href={href} key={href}>{label}</Link>
          ))}
        </nav>
      </section>
      {children}
    </div>
  );
}
