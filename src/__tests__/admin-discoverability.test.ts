import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getAuthenticatedHomePath } from "@/lib/supabase/admin-role";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("admin discoverability", () => {
  it("uses role-aware post-login destinations", () => {
    expect(getAuthenticatedHomePath("admin")).toBe("/admin/autopilot");
    expect(getAuthenticatedHomePath("marketplace_admin")).toBe("/admin/autopilot");
    expect(getAuthenticatedHomePath("authenticated")).toBe("/account");
    expect(getAuthenticatedHomePath(undefined)).toBe("/account");
  });

  it("applies the role-aware destination to password and OAuth login", () => {
    const actions = read("src/app/auth/actions.ts");
    const callback = read("src/app/auth/callback/route.ts");
    expect(actions).toContain("getAuthenticatedHomePath(profile?.role)");
    expect(callback).toContain("getAuthenticatedHomePath(profile?.role)");
  });

  it("provides Studio entry points in the header and account area", () => {
    const header = read("src/components/SiteHeaderClient.tsx");
    const accountPage = read("src/app/account/page.tsx");
    const accountLayout = read("src/app/account/layout.tsx");
    expect(header).toContain("Autopilot");
    expect(accountPage).toContain("Victoriosa Studio");
    expect(accountLayout).toContain("Victoriosa Studio");
  });
});
