export function getSiteUrl() {
  const rawUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";
  const url = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
  return url.replace(/\/+$/, "");
}
