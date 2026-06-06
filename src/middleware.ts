import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv, validateSupabasePublicEnv } from "@/lib/supabase/env";

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPrivateControlSurface = pathname.startsWith("/admin") || pathname.startsWith("/owner");
  const requiresLogin = pathname.startsWith("/account") || pathname.startsWith("/wishlist") || isPrivateControlSurface;
  const forwardedHeaders = new Headers(request.headers);
  if (isPrivateControlSurface) forwardedHeaders.set("x-victoriosa-private-surface", "true");
  const envValidation = validateSupabasePublicEnv();

  if (!envValidation.ok) {
    if (requiresLogin) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request: { headers: forwardedHeaders } });
  }

  let response = NextResponse.next({ request: { headers: forwardedHeaders } });
  const { url, anonKey } = getSupabasePublicEnv();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies: CookieToSet[]) => {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request: { headers: forwardedHeaders } });
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && requiresLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
