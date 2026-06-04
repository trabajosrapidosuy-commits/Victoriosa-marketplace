import { createClient } from "@/lib/supabase/server";
import SiteHeaderClient from "@/components/SiteHeaderClient";

export default async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <SiteHeaderClient isAuthenticated={Boolean(user)} />;
}
