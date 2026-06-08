import { NextResponse } from "next/server";
import { getAuthenticatedHomePath } from "@/lib/supabase/admin-role";
import { createClient } from "@/lib/supabase/server";
import { getOAuthCallbackError, sanitizeSameSiteNextPath } from "@/lib/auth/oauth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextPath = sanitizeSameSiteNextPath(url.searchParams.get("next"));
  const isPasswordRecovery = nextPath === "/auth/reset-password";

  if (!code) {
    const errorUrl = new URL(
      isPasswordRecovery ? "/auth/forgot-password" : "/auth/login",
      url.origin,
    );
    errorUrl.searchParams.set(
      "error",
      isPasswordRecovery
        ? "El enlace de recuperacion no es valido o vencio. Solicita uno nuevo."
        : "Enlace de acceso invalido.",
    );
    return NextResponse.redirect(errorUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const errorUrl = new URL(
      isPasswordRecovery ? "/auth/forgot-password" : "/auth/login",
      url.origin,
    );
    errorUrl.searchParams.set(
      "error",
      isPasswordRecovery
        ? "El enlace de recuperacion no es valido o vencio. Solicita uno nuevo."
        : getOAuthCallbackError(),
    );
    return NextResponse.redirect(errorUrl);
  }

  let destination = nextPath ?? "/account";
  if (destination === "/account") {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("marketplace_profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      destination = getAuthenticatedHomePath(profile?.role);
    }
  }

  return NextResponse.redirect(new URL(destination, url.origin));
}
