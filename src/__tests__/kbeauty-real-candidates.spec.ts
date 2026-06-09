import { kbeautyAutopilotSeed } from "../../data/kbeautyAutopilotSeed";

describe("K-beauty seed real candidates", () => {
  it("includes DERMAFIRM brand candidate", () => {
    const dermafirm = kbeautyAutopilotSeed.brands.find((b) => b.slug === "dermafirm");
    expect(dermafirm).toBeDefined();
    expect(dermafirm?.country).toBe("South Korea");
    expect(dermafirm?.warnings && dermafirm.warnings.length).toBeGreaterThan(0);
    expect(dermafirm?.blockers && dermafirm.blockers.length).toBeGreaterThan(0);
  });

  it("includes KRX brand candidate with warnings and blockers", () => {
    const krx = kbeautyAutopilotSeed.brands.find((b) => b.slug === "krx-aesthetics");
    expect(krx).toBeDefined();
    expect(krx?.warnings && krx.warnings.length).toBeGreaterThan(0);
    expect(krx?.blockers && krx.blockers.length).toBeGreaterThan(0);
  });
});
