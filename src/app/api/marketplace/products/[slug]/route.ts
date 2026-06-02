import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import { getPublicProductBySlug } from "@/repositories/marketplace-repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const supabase = await createClient();
    const { slug } = await params;
    return NextResponse.json({ product: await getPublicProductBySlug(supabase, slug) });
  } catch (error) {
    return apiError(error);
  }
}
