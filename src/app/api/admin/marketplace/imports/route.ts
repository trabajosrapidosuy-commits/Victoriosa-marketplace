import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { listImportBatches, persistMarketplaceImport } from "@/repositories/marketplace-import-repository";
import { parseCsv } from "@/services/import-service";

export async function GET() {
  try {
    const { supabase } = await requireAdmin();
    return NextResponse.json({ batches: await listImportBatches(supabase) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireAdmin();
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("text/csv")) {
      const supplierName = request.headers.get("x-victoriosa-supplier-name") ?? "Manual CSV";
      const supplierType = request.headers.get("x-victoriosa-supplier-type") ?? "csv";
      return NextResponse.json({
        report: await persistMarketplaceImport(supabase, user.id, {
          sourceType: "csv",
          fileName: request.headers.get("x-victoriosa-file-name"),
          supplier: { name: supplierName, type: supplierType },
          rows: parseCsv(await request.text()),
        }),
      }, { status: 201 });
    }
    return NextResponse.json({ report: await persistMarketplaceImport(supabase, user.id, await request.json()) }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
