"use server";

import { redirect } from "next/navigation";
import { getAuthenticatedHomePath } from "@/lib/supabase/admin-role";
import { getSiteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function login(formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: value(formData, "email"),
    password: value(formData, "password"),
  });
  if (error) redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
  const { data: profile } = await supabase
    .from("marketplace_profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  redirect(getAuthenticatedHomePath(profile?.role));
}

export async function register(formData: FormData) {
  const supabase = await createClient();
  const origin = getSiteUrl();
  const { error } = await supabase.auth.signUp({
    email: value(formData, "email"),
    password: value(formData, "password"),
    options: { data: { full_name: value(formData, "full_name") }, emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) redirect(`/auth/register?error=${encodeURIComponent(error.message)}`);
  redirect("/auth/login?message=Revisa tu email para confirmar tu cuenta.");
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();
  const origin = getSiteUrl();
  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("next", "/auth/reset-password");
  const { error } = await supabase.auth.resetPasswordForEmail(value(formData, "email"), {
    redirectTo: callbackUrl.toString(),
  });
  if (error) redirect(`/auth/forgot-password?error=${encodeURIComponent(error.message)}`);
  redirect("/auth/login?message=Te enviamos instrucciones para recuperar tu clave.");
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: value(formData, "password") });
  if (error) redirect(`/auth/reset-password?error=${encodeURIComponent(error.message)}`);
  redirect("/account?message=Clave actualizada.");
}
