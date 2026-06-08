import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isAdminRole } from "@/lib/supabase/admin-role";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("private admin separation", () => {
  it("shows Studio discovery only after a server-side admin role check", () => {
    const header = read("src/components/SiteHeader.tsx");
    const headerClient = read("src/components/SiteHeaderClient.tsx");
    expect(header).toContain("marketplace_profiles");
    expect(header).toContain("isAdminRole(profile?.role)");
    expect(headerClient).toContain("canAccessStudio ?");
    expect(headerClient).toContain('href="/admin/autopilot"');
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
    const adminSidebar = read("src/components/admin/AdminSidebarNav.tsx");
    const menuConfig = read("src/lib/autopilot/admin/control-center.ts");
    const ownerEntry = read("src/app/owner/page.tsx");
    expect(adminLayout).toContain("await requireAdmin()");
    expect(adminLayout).toContain('title: "Victoriosa Studio"');
    expect(adminLayout).toContain("robots: { index: false, follow: false }");
    expect(adminLayout).toContain("AdminSidebarNav");
    expect(adminSidebar).toContain('title="Autopilot"');
    expect(menuConfig).toContain('href: "/admin/autopilot/review"');
    expect(menuConfig).toContain('href: "/admin/autopilot/drafts"');
    expect(menuConfig).toContain('href: "/admin/autopilot/security"');
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

  it("makes Studio discoverable from an authenticated admin account", () => {
    const accountPage = read("src/app/account/page.tsx");
    const accountLayout = read("src/app/account/layout.tsx");
    expect(accountPage).toContain("isAdminRole(profile?.role)");
    expect(accountPage).toContain("Victoriosa Studio");
    expect(accountPage).toContain('href="/admin/autopilot"');
    expect(accountLayout).toContain("isAdminRole(profile?.role)");
    expect(accountLayout).toContain("Victoriosa Studio");
  });
});
