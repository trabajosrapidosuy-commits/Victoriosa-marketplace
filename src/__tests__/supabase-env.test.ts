import { describe, expect, it } from "vitest";
import { getSupabasePublicEnv, maskSecretForLog, validateSupabasePublicEnv } from "@/lib/supabase/env";

function asEnv(env: Record<string, string>): NodeJS.ProcessEnv {
  return env as NodeJS.ProcessEnv;
}

describe("supabase public env helper", () => {
  it("accepts a well-formed public URL and anon key", () => {
    const validation = validateSupabasePublicEnv(asEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://exampleproject.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "sb_publishable_abcdefghijklmnopqrstuvwxyz123456",
    }));

    expect(validation.ok).toBe(true);
    expect(validation.urlState).toBe("valid");
    expect(validation.keyState).toBe("valid");
    expect(validation.maskedAnonKey).toBe("[set]");
  });

  it("rejects placeholder or too-short anon keys", () => {
    const validation = validateSupabasePublicEnv(asEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://exampleproject.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "your-anon-key",
    }));

    expect(validation.ok).toBe(false);
    expect(validation.issues.join(" ")).toContain("placeholder");
  });

  it("throws a typed error when public env is invalid", () => {
    expect(() => getSupabasePublicEnv(asEnv({
      NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "short",
    }))).toThrow("[supabase-env] Invalid public Supabase configuration");
  });

  it("reports secret presence without exposing fragments", () => {
    expect(maskSecretForLog("eyJabcdefghijklmnopqrstuvxyz")).toBe("[set]");
    expect(maskSecretForLog("")).toBe("[missing]");
  });
});
