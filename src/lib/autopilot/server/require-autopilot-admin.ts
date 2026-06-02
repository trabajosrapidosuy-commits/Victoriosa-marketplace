import "server-only";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function requireAutopilotAdmin() {
  return requireAdmin();
}
