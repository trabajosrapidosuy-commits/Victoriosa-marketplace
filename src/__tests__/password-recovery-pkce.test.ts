import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("password recovery PKCE flow", () => {
  it("sends new recovery links through the server callback", () => {
    const actions = fs.readFileSync(
      path.join(root, "src/app/auth/actions.ts"),
      "utf8",
    );

    expect(actions).toContain('new URL("/auth/callback", origin)');
    expect(actions).toContain(
      'callbackUrl.searchParams.set("next", "/auth/reset-password")',
    );
    expect(actions).toContain("redirectTo: callbackUrl.toString()");
  });

  it("rescues existing links that redirect directly with an auth code", () => {
    const resetPage = fs.readFileSync(
      path.join(root, "src/app/auth/reset-password/page.tsx"),
      "utf8",
    );

    expect(resetPage).toContain("if (code)");
    expect(resetPage).toContain('next: "/auth/reset-password"');
    expect(resetPage).toContain('redirect(`/auth/callback?${callbackParams.toString()}`)');
  });
});
