import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import { listPublicProducts } from "@/repositories/marketplace-repository";

export async function GET() {
  try {
    const supabase = await createClient();
    return NextResponse.json({ products: await listPublicProducts(supabase) });
  } catch (error) {
    return apiError(error);
  }
}
