import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const migration = fs.readFileSync(
  path.join(root, "supabase/migrations/20260602000300_victoriosa_email_auth_profiles_settings.sql"),
  "utf8",
);

describe("email auth profile boundary", () => {
  it("keeps anonymous users out of private profile and settings tables", () => {
    expect(migration).toContain("revoke all on public.marketplace_profiles from anon");
    expect(migration).toContain("revoke all on public.user_settings from anon");
    expect(migration).toContain("alter table public.user_settings enable row level security");
  });

  it("lets users update presentation fields without granting role escalation", () => {
    const profileGrant = migration.match(/grant update \(([^)]+)\) on public\.marketplace_profiles to authenticated;/)?.[1] ?? "";
    expect(profileGrant).toContain("full_name");
    expect(profileGrant).toContain("onboarding_completed");
    expect(profileGrant).not.toContain("role");
  });

  it("creates profile and settings rows from auth.users", () => {
    expect(migration).toContain("private.handle_new_marketplace_user()");
    expect(migration).toContain("after insert on auth.users");
    expect(migration).toContain("insert into public.user_settings (user_id)");
  });

  it("refreshes sessions and redirects anonymous private traffic", () => {
    const middleware = fs.readFileSync(path.join(root, "middleware.ts"), "utf8");
    expect(middleware).toContain("await supabase.auth.getUser()");
    expect(middleware).toContain('pathname.startsWith("/account")');
    expect(middleware).toContain('pathname.startsWith("/wishlist")');
    expect(middleware).toContain('pathname.startsWith("/admin")');
    expect(middleware).toContain('url.pathname = "/auth/login"');
  });
});
