"use client";

import Link from "next/link";
import { useCart } from "@/lib/useCart";

export default function CheckoutPage() {
  const { items, loaded, total } = useCart();
  if (!loaded) return <main className="container-page"><p>Cargando...</p></main>;
  return (
    <main className="container-page">
      <section className="card">
        <h1>Checkout manual</h1>
        <p>Los pagos online todavia no estan habilitados. Este paso permite revisar tu seleccion antes de solicitar asesoramiento.</p>
        <p>Productos: {items.length}. Total estimado: UYU {Math.round(total)}.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="btn" href="/evaluacion-online">Solicitar asesoramiento</Link>
          <Link className="btn btn-secondary" href="/carrito">Volver al carrito</Link>
        </div>
      </section>
    </main>
  );
}
