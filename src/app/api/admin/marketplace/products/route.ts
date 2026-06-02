import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createDraftProduct, listAdminProducts, updateDraftProduct } from "@/repositories/marketplace-repository";

export async function GET() {
  try {
    const { supabase } = await requireAdmin();
    return NextResponse.json({ products: await listAdminProducts(supabase) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    return NextResponse.json({ product: await createDraftProduct(supabase, await request.json()) }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    return NextResponse.json({ product: await updateDraftProduct(supabase, await request.json()) });
  } catch (error) {
    return apiError(error);
  }
}
