import { legacyApiDeprecated } from "@/lib/api/deprecated";

export function PUT() {
  return legacyApiDeprecated("/api/admin/marketplace/products");
}
