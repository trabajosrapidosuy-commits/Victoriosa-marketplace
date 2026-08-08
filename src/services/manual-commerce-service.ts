import "server-only";

import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PUBLIC_PRODUCT_FILTER } from "@/domain/marketplace-contract";

const manualOrderSchema = z.object({
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1).max(10) })).min(1).max(20),
  customerNotes: z.string().trim().max(1000).optional(),
});

export async function createManualOrder(supabase: SupabaseClient, userId: string, raw: unknown) {
  const input = manualOrderSchema.parse(raw);
  const ids = [...new Set(input.items.map((item) => item.productId))];
  const { data: products, error } = await supabase.from("marketplace_products")
    .select("id,supplier_id,title,source_url,cost_price,sale_price,currency,estimated_delivery_min_days,estimated_delivery_max_days")
    .in("id", ids).match(PUBLIC_PRODUCT_FILTER);
  if (error) throw new Error(error.message);
  if (!products || products.length !== ids.length) throw new Error("One or more products are unavailable");

  const byId = new Map(products.map((product) => [product.id, product]));
  const items = input.items.map((item) => ({ product: byId.get(item.productId)!, quantity: item.quantity }));
  const subtotal = items.reduce((sum, item) => sum + Number(item.product.sale_price) * item.quantity, 0);
  const currency = String(items[0]?.product.currency ?? "UYU");
  const { data: order, error: orderError } = await supabase.from("marketplace_orders").insert({
    buyer_user_id: userId, status: "pending_payment", subtotal, total: subtotal, currency,
    customer_notes: input.customerNotes || "Manual checkout request. Payments remain disabled.",
  }).select("id").single();
  if (orderError || !order) throw new Error(orderError?.message ?? "Could not create order");

  const { error: itemsError } = await supabase.from("marketplace_order_items").insert(items.map(({ product, quantity }) => ({
    order_id: order.id, product_id: product.id, supplier_id: product.supplier_id, title_snapshot: product.title,
    source_url_snapshot: product.source_url, cost_price_snapshot: product.cost_price, sale_price_snapshot: product.sale_price,
    quantity, estimated_delivery_min_days: product.estimated_delivery_min_days, estimated_delivery_max_days: product.estimated_delivery_max_days,
  })));
  if (itemsError) throw new Error(itemsError.message);
  return order.id as string;
}

export async function listCustomerOrders(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase.from("marketplace_orders")
    .select("id,status,total,currency,created_at,marketplace_order_items(id,title_snapshot,quantity)")
    .eq("buyer_user_id", userId).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getCustomerOrder(supabase: SupabaseClient, userId: string, id: string) {
  const orderId = z.string().uuid().parse(id);
  const { data, error } = await supabase.from("marketplace_orders")
    .select("id,status,total,currency,created_at,customer_notes,marketplace_order_items(title_snapshot,quantity,sale_price_snapshot,estimated_delivery_min_days,estimated_delivery_max_days,tracking_number,tracking_url)")
    .eq("id", orderId).eq("buyer_user_id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}
