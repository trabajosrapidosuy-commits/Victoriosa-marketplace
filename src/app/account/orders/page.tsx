import Link from "next/link";
import { requireUser } from "@/lib/supabase/require-user";
import { listCustomerOrders } from "@/services/manual-commerce-service";

export default async function AccountOrdersPage() {
  const { supabase, user } = await requireUser();
  const orders = await listCustomerOrders(supabase, user.id);
  return <section className="account-content card"><h1>Mis solicitudes</h1><p>Los pagos permanecen deshabilitados hasta confirmar disponibilidad y condiciones.</p>{orders.length === 0 ? <p>Todavía no tenés solicitudes. Cuando envíes una compra manual aparecerá aquí.</p> : <div className="mt-4 grid gap-3">{orders.map((order) => <Link className="card" href={`/account/orders/${order.id}`} key={order.id}><strong>Solicitud {String(order.id).slice(0, 8)}</strong><p className="text-sm">Estado: {order.status} · UYU {Math.round(Number(order.total))}</p><p className="text-sm">{order.marketplace_order_items.length} productos · {new Date(String(order.created_at)).toLocaleDateString("es-UY")}</p></Link>)}</div>}</section>;
}
