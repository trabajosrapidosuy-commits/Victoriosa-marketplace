import Link from "next/link";
import { requireUser } from "@/lib/supabase/require-user";

export default async function WishlistPage() {
  await requireUser();
  return <main className="container-page"><section className="card"><p className="eyebrow">SELECCION PERSONAL</p><h1>Favoritos</h1><p>Guarda tus productos preferidos para encontrarlos facilmente. La persistencia de favoritos se habilitara en el siguiente ciclo.</p><Link className="editorial-button inline-button" href="/productos">Descubrir productos</Link></section></main>;
}
