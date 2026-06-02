import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { MarketplaceAccessError } from "@/lib/supabase/require-admin";

export function apiError(error: unknown) {
  if (error instanceof MarketplaceAccessError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof ZodError) {
    return NextResponse.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
  }
  const message = error instanceof Error ? error.message : "Unknown error";
  return NextResponse.json({ error: message }, { status: 500 });
}
