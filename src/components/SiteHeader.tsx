import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const nav = [
  ["Rituales", "/productos"],
  ["Rostro", "/productos?categoria=Cuidado facial"],
  ["Cuerpo", "/productos?categoria=Cuidado corporal"],
  ["Kits", "/kits"],
  ["Asesoria", "/evaluacion-online"],
];

export default async function SiteHeader() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <header className="site-header">
      <div className="header-utility">
        <span>Belleza consciente · estetica profesional · bienestar femenino</span>
        <div className="header-account">
          {user ? <Link href="/account">Mi cuenta</Link> : <Link href="/auth/login">Ingresar</Link>}
          {user ? <form action="/auth/logout" method="post"><button type="submit">Salir</button></form> : <Link href="/auth/register">Crear cuenta</Link>}
          <Link href="/carrito">Carrito</Link>
        </div>
      </div>
      <Link className="brand-wordmark" href="/">VICTORIOSA<span>BELLEZA EN CALMA</span></Link>
      <nav className="editorial-nav" aria-label="Navegacion principal">
        {nav.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
      </nav>
    </header>
  );
}
