import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createSupplier, listSuppliers, updateSupplier } from "@/repositories/marketplace-repository";

export async function GET() {
  try {
    const { supabase } = await requireAdmin();
    return NextResponse.json({ suppliers: await listSuppliers(supabase) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    return NextResponse.json({ supplier: await createSupplier(supabase, await request.json()) }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    return NextResponse.json({ supplier: await updateSupplier(supabase, await request.json()) });
  } catch (error) {
    return apiError(error);
  }
}
