import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MarketplaceAccessError, requireAdmin } from "@/lib/supabase/require-admin";

export const metadata: Metadata = {
  title: "Victoriosa Studio",
  robots: { index: false, follow: false },
};

const links = [
  ["/admin", "Resumen"],
  ["/admin/autopilot", "Autopilot"],
  ["/admin/marketplace/products/review", "Cola de revision"],
  ["/admin/marketplace/products/import", "Importar drafts"],
  ["/admin/marketplace/products", "Productos"],
  ["/admin/marketplace/orders", "Pedidos"],
  ["/admin/marketplace/suppliers", "Proveedores"],
  ["/admin/marketplace/settings", "Configuracion"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof MarketplaceAccessError) {
      redirect(error.status === 401 ? "/auth/login" : "/");
    }
    throw error;
  }

  return (
    <div className="studio-shell">
      <aside className="studio-sidebar">
        <div>
          <p className="studio-kicker">CONTROL CENTER</p>
          <h1>Victoriosa Studio</h1>
          <p className="studio-caption">Superficie privada del propietario</p>
        </div>
        <nav className="studio-nav" aria-label="Navegacion privada">
          {links.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}
        </nav>
        <form action="/auth/logout" method="post">
          <button className="studio-logout" type="submit">Cerrar sesion</button>
        </form>
      </aside>
      <main className="studio-main">{children}</main>
    </div>
  );
}
