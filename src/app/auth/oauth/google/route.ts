import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${url.origin}/auth/callback` },
  });

  if (error || !data.url) {
    const message = error?.message ?? "No se pudo iniciar Google OAuth.";
    return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(message)}`, url.origin));
  }

  return NextResponse.redirect(data.url);
}
