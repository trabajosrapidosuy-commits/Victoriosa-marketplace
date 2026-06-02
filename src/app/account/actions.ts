"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/require-user";

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

export async function saveProfile(formData: FormData) {
  const { supabase, user } = await requireUser();
  const payload = {
    full_name: text(formData, "full_name"),
    phone: text(formData, "phone"),
    country: text(formData, "country"),
    city: text(formData, "city"),
    preferred_currency: text(formData, "preferred_currency") || "UYU",
    marketing_opt_in: formData.get("marketing_opt_in") === "on",
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("marketplace_profiles").update(payload).eq("id", user.id);
  if (error) redirect(`/account/profile?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/account");
  redirect("/account/profile?message=Perfil actualizado.");
}

export async function saveSettings(formData: FormData) {
  const { supabase, user } = await requireUser();
  const payload = {
    language: text(formData, "language") || "es",
    theme: text(formData, "theme") || "system",
    email_notifications: formData.get("email_notifications") === "on",
    product_recommendations: formData.get("product_recommendations") === "on",
    autopilot_suggestions: formData.get("autopilot_suggestions") === "on",
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("user_settings").update(payload).eq("user_id", user.id);
  if (error) redirect(`/account/settings?error=${encodeURIComponent(error.message)}`);
  redirect("/account/settings?message=Preferencias actualizadas.");
}
