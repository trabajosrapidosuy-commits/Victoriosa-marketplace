import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { listReviewQueue, updateReview } from "@/repositories/marketplace-repository";

export async function GET() {
  try {
    const { supabase } = await requireAdmin();
    return NextResponse.json({ reviews: await listReviewQueue(supabase) });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    return NextResponse.json({ review: await updateReview(supabase, await request.json()) });
  } catch (error) {
    return apiError(error);
  }
}
