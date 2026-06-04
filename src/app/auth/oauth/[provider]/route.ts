import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import { isAllowedOAuthProvider, sanitizeSameSiteNextPath } from "@/lib/auth/oauth";

export async function GET(request: Request, context: { params: Promise<{ provider: string }> }) {
  const params = await context.params;
  const provider = params.provider;
  if (!isAllowedOAuthProvider(provider)) {
    const fallback = new URL("/auth", getSiteUrl());
    fallback.searchParams.set("error", "unsupported_provider");
    return NextResponse.redirect(fallback);
  }

  const url = new URL(request.url);
  const safeNext = sanitizeSameSiteNextPath(url.searchParams.get("next"));
  const redirectTo = new URL("/auth/callback", getSiteUrl());
  if (safeNext) redirectTo.searchParams.set("next", safeNext);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: redirectTo.toString() },
  });

  if (error || !data?.url) {
    const fallback = new URL("/auth", getSiteUrl());
    fallback.searchParams.set("error", "oauth_start_failed");
    return NextResponse.redirect(fallback);
  }

  return NextResponse.redirect(data.url);
}
