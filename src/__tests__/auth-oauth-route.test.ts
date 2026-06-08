import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { GET as oauthRouteGET } from "@/app/auth/oauth/[provider]/route";
import { GET as callbackRouteGET } from "@/app/auth/callback/route";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

const mockedCreateClient = vi.mocked(createClient);

describe("OAuth provider route", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    vi.resetAllMocks();
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it("starts Google OAuth with a safe next path", async () => {
    const signInWithOAuth = vi.fn(() => Promise.resolve({ data: { url: "https://supabase.example.com/redirect" }, error: null }));
    mockedCreateClient.mockResolvedValue({ auth: { signInWithOAuth } } as any);

    const request = new Request("https://example.com/auth/oauth/google?next=/productos");
    const response = await oauthRouteGET(request, {
      params: Promise.resolve({ provider: "google" }),
    });

    expect(response.headers.get("location")).toBe("https://supabase.example.com/redirect");
    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: "https://example.com/auth/callback?next=%2Fproductos" },
    });
  });

  it("keeps the callback on the request origin", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://configured.example.com";
    const signInWithOAuth = vi.fn(() =>
      Promise.resolve({
        data: { url: "https://supabase.example.com/redirect" },
        error: null,
      }),
    );
    mockedCreateClient.mockResolvedValue({ auth: { signInWithOAuth } } as any);

    const request = new Request("https://preview.example.com/auth/oauth/google");
    await oauthRouteGET(request, {
      params: Promise.resolve({ provider: "google" }),
    });

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: "https://preview.example.com/auth/callback",
      },
    });
  });

  it("rejects an unsupported provider with an error redirect", async () => {
    const request = new Request("https://example.com/auth/oauth/facebook");
    const response = await oauthRouteGET(request, {
      params: Promise.resolve({ provider: "facebook" }),
    });

    expect(response.headers.get("location")).toBe("https://example.com/auth?error=unsupported_provider");
  });

  it("redirects to auth on OAuth start failure", async () => {
    const signInWithOAuth = vi.fn(() => Promise.resolve({ data: null, error: { message: "Provider not configured" } }));
    mockedCreateClient.mockResolvedValue({ auth: { signInWithOAuth } } as any);

    const request = new Request("https://example.com/auth/oauth/google");
    const response = await oauthRouteGET(request, {
      params: Promise.resolve({ provider: "google" }),
    });

    expect(response.headers.get("location")).toBe("https://example.com/auth?error=oauth_start_failed");
  });

  it("ignores unsafe next values and does not pass them to Supabase", async () => {
    const signInWithOAuth = vi.fn(() => Promise.resolve({ data: { url: "https://supabase.example.com/redirect" }, error: null }));
    mockedCreateClient.mockResolvedValue({ auth: { signInWithOAuth } } as any);

    const request = new Request("https://example.com/auth/oauth/google?next=https://evil.com");
    await oauthRouteGET(request, {
      params: Promise.resolve({ provider: "google" }),
    });

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: "https://example.com/auth/callback" },
    });
  });
});

describe("OAuth callback route", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    vi.resetAllMocks();
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it("redirects to a safe next path after session exchange", async () => {
    const exchangeCodeForSession = vi.fn(() => Promise.resolve({ data: null, error: null }));
    mockedCreateClient.mockResolvedValue({ auth: { exchangeCodeForSession } } as any);

    const request = new Request("https://example.com/auth/callback?code=abc123&next=/productos");
    const response = await callbackRouteGET(request);

    expect(response.headers.get("location")).toBe("https://example.com/productos");
  });

  it("exchanges a recovery code before opening the reset-password page", async () => {
    const exchangeCodeForSession = vi.fn(() => Promise.resolve({ data: null, error: null }));
    mockedCreateClient.mockResolvedValue({ auth: { exchangeCodeForSession } } as any);

    const request = new Request(
      "https://example.com/auth/callback?code=recovery-code&next=/auth/reset-password",
    );
    const response = await callbackRouteGET(request);

    expect(exchangeCodeForSession).toHaveBeenCalledWith("recovery-code");
    expect(response.headers.get("location")).toBe(
      "https://example.com/auth/reset-password",
    );
  });

  it("returns failed recovery exchanges to a generic recovery error", async () => {
    const exchangeCodeForSession = vi.fn(() =>
      Promise.resolve({
        data: null,
        error: { message: "PKCE code verifier not found in storage" },
      }),
    );
    mockedCreateClient.mockResolvedValue({ auth: { exchangeCodeForSession } } as any);

    const request = new Request(
      "https://example.com/auth/callback?code=recovery-code&next=/auth/reset-password",
    );
    const response = await callbackRouteGET(request);
    const location = new URL(response.headers.get("location")!);

    expect(location.pathname).toBe("/auth/forgot-password");
    expect(location.searchParams.get("error")).toBe(
      "El enlace de recuperacion no es valido o vencio. Solicita uno nuevo.",
    );
    expect(location.search).not.toContain("verifier");
  });

  it("falls back to /account when next is unsafe", async () => {
    const exchangeCodeForSession = vi.fn(() => Promise.resolve({ data: null, error: null }));
    const getUser = vi.fn(() => Promise.resolve({ data: { user: null }, error: null }));
    mockedCreateClient.mockResolvedValue({ auth: { exchangeCodeForSession, getUser } } as any);

    const request = new Request("https://example.com/auth/callback?code=abc123&next=https://evil.com");
    const response = await callbackRouteGET(request);

    expect(response.headers.get("location")).toBe("https://example.com/account");
  });

  it("sends marketplace admins to Studio after OAuth", async () => {
    const exchangeCodeForSession = vi.fn(() => Promise.resolve({ data: null, error: null }));
    const getUser = vi.fn(() =>
      Promise.resolve({ data: { user: { id: "admin-user" } }, error: null }),
    );
    const maybeSingle = vi.fn(() =>
      Promise.resolve({ data: { role: "marketplace_admin" }, error: null }),
    );
    const eq = vi.fn(() => ({ maybeSingle }));
    const select = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ select }));
    mockedCreateClient.mockResolvedValue({
      auth: { exchangeCodeForSession, getUser },
      from,
    } as any);

    const request = new Request("https://example.com/auth/callback?code=abc123");
    const response = await callbackRouteGET(request);

    expect(from).toHaveBeenCalledWith("marketplace_profiles");
    expect(response.headers.get("location")).toBe(
      "https://example.com/admin/autopilot",
    );
  });

  it("preserves the callback origin and hides raw PKCE errors", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://configured.example.com";
    const exchangeCodeForSession = vi.fn(() =>
      Promise.resolve({
        data: null,
        error: { message: "PKCE code verifier not found in storage" },
      }),
    );
    mockedCreateClient.mockResolvedValue({ auth: { exchangeCodeForSession } } as any);

    const request = new Request("https://preview.example.com/auth/callback?code=abc123");
    const response = await callbackRouteGET(request);
    const location = new URL(response.headers.get("location")!);

    expect(location.origin).toBe("https://preview.example.com");
    expect(location.pathname).toBe("/auth/login");
    expect(location.searchParams.get("error")).toBe(
      "No pudimos completar el acceso con Google. Intenta nuevamente.",
    );
    expect(location.search).not.toContain("verifier");
  });
});
