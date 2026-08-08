import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { getAdminProductById, publishMarketplaceProduct } from "@/repositories/marketplace-repository";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await params;
    return NextResponse.json({ product: await getAdminProductById(supabase, id) });
  } catch (error) { return apiError(error); }
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await params;
    return NextResponse.json({ product: await publishMarketplaceProduct(supabase, { id }) });
  } catch (error) { return apiError(error); }
}
