import Link from "next/link";
import { isAdminRole } from "@/lib/supabase/admin-role";
import { requireUser } from "@/lib/supabase/require-user";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("marketplace_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return <main className="container-page account-layout">
    <aside className="account-nav card">
      <p className="eyebrow">MI CUENTA</p>
      {isAdminRole(profile?.role) ? <Link className="account-studio-link" href="/admin/autopilot">Victoriosa Studio / Autopilot</Link> : null}
      <Link href="/account">Resumen</Link>
      <Link href="/account/profile">Perfil</Link>
      <Link href="/account/settings">Preferencias</Link>
      <Link href="/account/orders">Mis pedidos</Link>
      <Link href="/wishlist">Favoritos</Link>
      <Link href="/carrito">Carrito</Link>
    </aside>
    <section>{children}</section>
  </main>;
}
