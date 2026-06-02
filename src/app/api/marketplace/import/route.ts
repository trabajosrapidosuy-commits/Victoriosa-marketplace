import { legacyApiDeprecated } from "@/lib/api/deprecated";

export function POST() {
  return legacyApiDeprecated("/api/admin/marketplace/imports");
}
