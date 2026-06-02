import { redirect } from "next/navigation";
import { MarketplaceAccessError, requireAdmin } from "@/lib/supabase/require-admin";

export default async function OwnerEntryPage() {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof MarketplaceAccessError) redirect(error.status === 401 ? "/auth/login" : "/");
    throw error;
  }
  redirect("/admin");
}
