import { NextResponse } from "next/server";
import { importProductsFromRows, parseCsv } from "@/services/import-service";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("text/csv")) {
    const text = await request.text();
    return NextResponse.json(importProductsFromRows(parseCsv(text)));
  }
  const body = await request.json();
  const rows = Array.isArray(body) ? body : body.rows;
  return NextResponse.json(importProductsFromRows(rows ?? []));
}
