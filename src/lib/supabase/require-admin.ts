import "server-only";
import { createClient } from "./server";
import { isAdminRole } from "./admin-role";

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new MarketplaceAccessError("Unauthorized", 401);

  const { data: profile, error: profileError } = await supabase
    .from("marketplace_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || !isAdminRole(profile.role)) {
    throw new MarketplaceAccessError("Forbidden", 403);
  }

  return { supabase, user };
}

export class MarketplaceAccessError extends Error {
  constructor(message: string, public readonly status: 401 | 403) {
    super(message);
  }
}

export { MarketplaceAccessError as AutopilotAccessError };
