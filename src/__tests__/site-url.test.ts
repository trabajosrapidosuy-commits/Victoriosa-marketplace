import { afterEach, describe, expect, it } from "vitest";
import { getSiteUrl } from "@/lib/site-url";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("getSiteUrl", () => {
  it("prefers the canonical public site URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://victoriosa.click/";
    process.env.NEXT_PUBLIC_VERCEL_URL = "preview.vercel.app";
    expect(getSiteUrl()).toBe("https://victoriosa.click");
  });

  it("supports Vercel preview URLs without an explicit protocol", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_VERCEL_URL = "victoriosa-preview.vercel.app";
    expect(getSiteUrl()).toBe("https://victoriosa-preview.vercel.app");
  });

  it("keeps the development fallback", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_VERCEL_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });
});
