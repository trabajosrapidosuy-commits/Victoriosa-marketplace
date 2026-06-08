import Link from "next/link";
import { isAdminRole } from "@/lib/supabase/admin-role";
import { requireUser } from "@/lib/supabase/require-user";

export default async function AccountPage() {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("marketplace_profiles")
    .select("full_name,onboarding_completed,role")
    .eq("id", user.id)
    .maybeSingle();
  return <section className="account-content card">
    <p className="eyebrow">TU CUENTA VICTORIOSA</p>
    <h1>Hola, {profile?.full_name || user.email}</h1>
    <p>Tu cuenta ayuda a guardar pedidos, favoritos y recomendaciones personalizadas.</p>
    {!profile?.onboarding_completed ? <p className="demo-notice">Completa tu perfil para recibir una experiencia mas personalizada.</p> : null}
    <div className="account-grid">
      {isAdminRole(profile?.role) ? (
        <Link className="account-tile account-tile-studio" href="/admin/autopilot">
          <strong>Victoriosa Studio / Autopilot</strong>
          <span>Administrar Autopilot, revision y marketplace.</span>
        </Link>
      ) : null}
      <Link className="account-tile" href="/account/profile">Mi perfil</Link>
      <Link className="account-tile" href="/account/settings">Preferencias</Link>
      <Link className="account-tile" href="/account/orders">Mis pedidos</Link>
      <Link className="account-tile" href="/wishlist">Favoritos</Link>
    </div>
  </section>;
}
