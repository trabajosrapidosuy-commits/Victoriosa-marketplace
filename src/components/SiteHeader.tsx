import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const nav = [
  ["Novedades", "/productos"],
  ["Rostro", "/productos?categoria=Cuidado facial"],
  ["Cuerpo", "/productos?categoria=Cuidado corporal"],
  ["Kits", "/kits"],
  ["Evaluacion online", "/evaluacion-online"],
];

export default async function SiteHeader() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data } = await supabase.from("marketplace_profiles").select("role").eq("id", user.id).maybeSingle();
    isAdmin = data?.role === "admin" || data?.role === "marketplace_admin";
  }
  return (
    <header className="site-header">
      <div className="header-utility">
        <span>Estetica profesional y seleccion responsable</span>
        <div className="header-account">
          {user ? <Link href="/account">Mi cuenta</Link> : <Link href="/auth/login">Ingresar</Link>}
          {user ? <form action="/auth/logout" method="post"><button type="submit">Salir</button></form> : <Link href="/auth/register">Crear cuenta</Link>}
          {isAdmin ? <Link href="/admin">Admin</Link> : null}
          <Link href="/carrito">Carrito</Link>
        </div>
      </div>
      <Link className="brand-wordmark" href="/">VICTORIOSA<span>ESTETICA PROFESIONAL</span></Link>
      <nav className="editorial-nav" aria-label="Navegacion principal">
        {nav.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
      </nav>
    </header>
  );
}
