import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isAdminRole } from "@/lib/supabase/admin-role";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("private admin separation", () => {
  it("keeps the storefront header free of admin discovery", () => {
    const header = read("src/components/SiteHeader.tsx");
    expect(header).not.toContain('href="/admin"');
    expect(header).not.toContain("marketplace_profiles");
  });

  it("omits the storefront header for private control surfaces", () => {
    const rootLayout = read("src/app/layout.tsx");
    const middleware = read("src/middleware.ts");
    expect(rootLayout).toContain('x-victoriosa-private-surface');
    expect(rootLayout).toContain("isPrivateControlSurface ? null : <SiteHeader />");
    expect(middleware).toContain('pathname.startsWith("/admin")');
    expect(middleware).toContain('pathname.startsWith("/owner")');
  });

  it("uses a private noindex studio layout and owner aliases", () => {
    const adminLayout = read("src/app/admin/layout.tsx");
    const ownerEntry = read("src/app/owner/page.tsx");
    expect(adminLayout).toContain("await requireAdmin()");
    expect(adminLayout).toContain('title: "Victoriosa Studio"');
    expect(adminLayout).toContain("robots: { index: false, follow: false }");
    expect(ownerEntry).toContain("await requireAdmin()");
    expect(ownerEntry).toContain('error.status === 401 ? "/auth/login" : "/"');
    expect(ownerEntry).toContain('redirect("/admin")');
  });

  it("accepts only explicit owner roles", () => {
    expect(isAdminRole("admin")).toBe(true);
    expect(isAdminRole("marketplace_admin")).toBe(true);
    expect(isAdminRole("authenticated")).toBe(false);
    expect(isAdminRole("reviewer")).toBe(false);
  });
});
