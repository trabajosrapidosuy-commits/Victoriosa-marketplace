import { legacyApiDeprecated } from "@/lib/api/deprecated";

export function GET() {
  return legacyApiDeprecated("/api/marketplace/products");
}
