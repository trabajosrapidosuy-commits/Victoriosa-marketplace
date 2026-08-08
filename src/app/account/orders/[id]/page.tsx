import { notFound } from "next/navigation";
import { requireUser } from "@/lib/supabase/require-user";
import { getCustomerOrder } from "@/services/manual-commerce-service";

export default async function AccountOrderDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ message?: string }> }) {
  const { id } = await params; const { message } = await searchParams; const { supabase, user } = await requireUser();
  const order = await getCustomerOrder(supabase, user.id, id); if (!order) notFound();
  return <section className="account-content card"><h1>Solicitud {order.id.slice(0, 8)}</h1>{message ? <p className="demo-notice">{message}</p> : null}<p>Estado: <strong>{order.status}</strong></p><p>Total estimado: {order.currency} {Math.round(Number(order.total))}</p><p>Creada: {new Date(order.created_at).toLocaleString("es-UY")}</p><p>Nota: {order.customer_notes || "Sin nota"}</p><h2 className="mt-4 text-lg font-bold">Productos</h2><ul className="mt-2 grid gap-2">{order.marketplace_order_items.map((item) => <li className="rounded border p-3" key={`${item.title_snapshot}-${item.quantity}`}><strong>{item.title_snapshot}</strong> · {item.quantity} × {order.currency} {Math.round(Number(item.sale_price_snapshot))}<br /><span className="text-sm">Entrega estimada: {item.estimated_delivery_min_days ?? "—"}-{item.estimated_delivery_max_days ?? "—"} días</span>{item.tracking_number ? <span className="text-sm"> · Tracking: {item.tracking_number}</span> : null}</li>)}</ul><p className="mt-4 text-sm">No se ejecutó pago, compra a proveedor ni envío automático.</p></section>;
}
