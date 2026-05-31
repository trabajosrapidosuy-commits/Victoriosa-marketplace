import type { MarketplaceProduct, OrderStatus } from "@/types/marketplace";
import { calculateProfit } from "./pricing-service";

export interface MarketplaceOrderItemInput {
  product: MarketplaceProduct;
  quantity: number;
}

export interface MarketplaceOrder {
  id: string;
  status: OrderStatus;
  items: MarketplaceOrderItemInput[];
  subtotal: number;
  shippingTotal: number;
  total: number;
  currency: string;
  supplierTasks: string[];
}

export function createMarketplaceOrder(items: MarketplaceOrderItemInput[]): MarketplaceOrder {
  const subtotal = items.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);
  const shippingTotal = 0;
  return {
    id: `order-${Date.now()}`,
    status: "pending_payment",
    items,
    subtotal,
    shippingTotal,
    total: subtotal + shippingTotal,
    currency: "UYU",
    supplierTasks: []
  };
}

export function createManualSupplierTask(order: MarketplaceOrder): MarketplaceOrder {
  return {
    ...order,
    status: "supplier_pending",
    supplierTasks: order.items.map((item) => `Comprar ${item.quantity} x ${item.product.title} en proveedor y registrar referencia.`)
  };
}

export function markSupplierOrdered(order: MarketplaceOrder, reference: string): MarketplaceOrder {
  return { ...order, status: "supplier_ordered", supplierTasks: [...order.supplierTasks, `Referencia proveedor: ${reference}`] };
}

export function updateTracking(order: MarketplaceOrder, tracking: string): MarketplaceOrder {
  return { ...order, status: "shipped", supplierTasks: [...order.supplierTasks, `Tracking: ${tracking}`] };
}

export function markDelivered(order: MarketplaceOrder): MarketplaceOrder {
  return { ...order, status: "delivered" };
}

export function markRefunded(order: MarketplaceOrder): MarketplaceOrder {
  return { ...order, status: "refunded" };
}

export function calculateOrderProfit(order: MarketplaceOrder): number {
  const totalCost = order.items.reduce((sum, item) => sum + (item.product.costPrice + item.product.shippingCost) * item.quantity, 0);
  return calculateProfit(order.total, totalCost);
}
