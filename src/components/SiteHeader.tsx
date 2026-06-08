import { createClient } from "@/lib/supabase/server";
import { isAdminRole } from "@/lib/supabase/admin-role";
import SiteHeaderClient from "@/components/SiteHeaderClient";

export default async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase
        .from("marketplace_profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  return (
    <SiteHeaderClient
      canAccessStudio={isAdminRole(profile?.role)}
      isAuthenticated={Boolean(user)}
    />
  );
}
