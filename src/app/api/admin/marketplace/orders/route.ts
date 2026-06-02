import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { listOrders, updateOrder } from "@/repositories/marketplace-repository";

export async function GET() {
  try {
    const { supabase } = await requireAdmin();
    return NextResponse.json({ orders: await listOrders(supabase) });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    return NextResponse.json({ order: await updateOrder(supabase, await request.json()) });
  } catch (error) {
    return apiError(error);
  }
}
