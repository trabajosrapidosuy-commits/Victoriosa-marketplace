import { legacyApiDeprecated } from "@/lib/api/deprecated";

export function GET() {
  return legacyApiDeprecated("Prompt 04: canonical marketplace order endpoint");
}

export function PUT() {
  return legacyApiDeprecated("/api/admin/marketplace/orders");
}
