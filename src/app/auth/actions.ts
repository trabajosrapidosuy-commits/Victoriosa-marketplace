"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function getOrigin() {
  const headerStore = await headers();
  return headerStore.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function login(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: value(formData, "email"), password: value(formData, "password") });
  if (error) redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
  redirect("/account");
}

export async function register(formData: FormData) {
  const supabase = await createClient();
  const origin = await getOrigin();
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
  const origin = await getOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(value(formData, "email"), { redirectTo: `${origin}/auth/reset-password` });
  if (error) redirect(`/auth/forgot-password?error=${encodeURIComponent(error.message)}`);
  redirect("/auth/login?message=Te enviamos instrucciones para recuperar tu clave.");
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: value(formData, "password") });
  if (error) redirect(`/auth/reset-password?error=${encodeURIComponent(error.message)}`);
  redirect("/account?message=Clave actualizada.");
}
