import { beforeEach, describe, expect, it, vi } from "vitest";

const createClientMock = vi.fn();
const listPublicProductsMock = vi.fn();
const getPublicProductBySlugMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

vi.mock("@/repositories/marketplace-repository", () => ({
  listPublicProducts: listPublicProductsMock,
  getPublicProductBySlug: getPublicProductBySlugMock,
}));

describe("public catalog service", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete process.env.VICTORIOSA_DEMO_MODE;
  });

  it("returns an empty array when Supabase catalog loading fails", async () => {
    createClientMock.mockRejectedValueOnce(new Error("Invalid API key"));
    const { getPublicCatalog } = await import("@/services/public-catalog-service");

    await expect(getPublicCatalog()).resolves.toEqual([]);
  });

  it("returns null when a public product lookup fails", async () => {
    createClientMock.mockResolvedValueOnce({ id: "server-client" });
    getPublicProductBySlugMock.mockRejectedValueOnce(new Error("Invalid API key"));
    const { getPublicCatalogProduct } = await import("@/services/public-catalog-service");

    await expect(getPublicCatalogProduct("slug")).resolves.toBeNull();
  });
});
