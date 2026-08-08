import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { TEST_CATALOG, TEST_SUPPLIER } from "@/lib/catalog/test-supplier";
import { syncCatalogProducts } from "@/services/catalog-sync-service";

export async function POST(request: Request) {
  const secret = process.env.CRON_SHARED_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({})) as { mode?: string };
  if (body.mode !== "test") {
    return NextResponse.json({ error: "Only the local test supplier is enabled in this phase." }, { status: 409 });
  }
  try {
    const supabase = createSupabaseAdminClient();
    const { data: supplier, error } = await supabase.from("suppliers").upsert({
      name: TEST_SUPPLIER.name, status: TEST_SUPPLIER.status, feed_type: TEST_SUPPLIER.feedType, country: TEST_SUPPLIER.country, currency: TEST_SUPPLIER.currency,
    }, { onConflict: "name" }).select("id").single();
    if (error || !supplier) throw new Error(error?.message ?? "Could not create test supplier");
    const result = await syncCatalogProducts(supabase, supplier.id, TEST_CATALOG, "test");
    return NextResponse.json({ ...result, source: "test_fixture", externalPublishing: false });
  } catch (error) {
    return NextResponse.json({ error: "Catalog sync failed" }, { status: 500 });
  }
}
