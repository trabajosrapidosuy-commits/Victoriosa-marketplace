"use client";

import Link from "next/link";
import { useCart } from "@/lib/useCart";

export default function CartPage() {
  const { items, loaded, removeItem, total, updateQuantity } = useCart();
  if (!loaded) return <main className="container-page"><p>Cargando carrito...</p></main>;
  return (
    <main className="container-page">
      <h1>Carrito</h1>
      <p>Preparacion manual de compra. No se procesan pagos reales.</p>
      {items.length === 0 ? (
        <section className="card"><p>Tu carrito esta vacio.</p><Link className="btn" href="/productos">Explorar productos</Link></section>
      ) : (
        <section className="card">
          {items.map((item) => (
            <div className="cart-row" key={item.product_id}>
              <div><strong>{item.name}</strong><p>UYU {Math.round(item.price)}</p></div>
              <div className="cart-actions">
                <button type="button" onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button type="button" onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>+</button>
                <button type="button" onClick={() => removeItem(item.product_id)}>Quitar</button>
              </div>
            </div>
          ))}
          <h2>Total estimado: UYU {Math.round(total)}</h2>
          <Link className="btn" href="/checkout">Continuar</Link>
        </section>
      )}
    </main>
  );
}
