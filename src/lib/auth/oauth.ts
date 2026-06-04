export const ALLOWED_OAUTH_PROVIDERS = ["google"] as const;
export type OAuthProvider = (typeof ALLOWED_OAUTH_PROVIDERS)[number];

export function isAllowedOAuthProvider(value: string): value is OAuthProvider {
  return (ALLOWED_OAUTH_PROVIDERS as readonly string[]).includes(value);
}

export function sanitizeSameSiteNextPath(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  if (typeof value !== "string") return undefined;
  if (!value.startsWith("/")) return undefined;
  if (value.startsWith("//")) return undefined;
  if (value.includes("\\")) return undefined;
  if (value.includes("://")) return undefined;
  try {
    const candidate = new URL(value, "https://example.com");
    if (candidate.origin !== "https://example.com") return undefined;
    return candidate.pathname + candidate.search + candidate.hash;
  } catch {
    return undefined;
  }
}
