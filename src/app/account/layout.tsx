import Link from "next/link";
import { requireUser } from "@/lib/supabase/require-user";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return <main className="container-page account-layout">
    <aside className="account-nav card">
      <p className="eyebrow">MI CUENTA</p>
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
