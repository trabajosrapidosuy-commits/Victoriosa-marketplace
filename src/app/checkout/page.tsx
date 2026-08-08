"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/lib/useCart";
import { submitManualOrder } from "./actions";

export default function CheckoutPage() {
  const { items, loaded, total } = useCart(); const params = useSearchParams();
  if (!loaded) return <main className="container-page"><p>Cargando...</p></main>;
  return <main className="container-page"><section className="card"><h1>Solicitud de compra</h1><p>Los pagos online siguen deshabilitados. Registraremos tu solicitud y confirmaremos disponibilidad antes de cualquier cobro.</p>{params.get("error") ? <p className="demo-notice">{params.get("error")}</p> : null}<p>Productos: {items.length}. Total estimado: UYU {Math.round(total)}.</p>{items.length ? <form action={submitManualOrder} className="mt-4 grid gap-3"><input name="items" type="hidden" value={JSON.stringify(items.map(({ product_id, quantity }) => ({ productId: product_id, quantity })))} /><label>Nota para la solicitud<textarea className="mt-1 w-full rounded border p-2" name="customerNotes" maxLength={1000} /></label><button className="btn" type="submit">Enviar solicitud de compra</button></form> : <Link className="btn" href="/productos">Explorar productos</Link>}<Link className="btn btn-secondary mt-3 inline-flex" href="/carrito">Volver al carrito</Link></section></main>;
}
