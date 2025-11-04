// b_path:: packages/b_generators/src/angle.test.ts
import { describe, expect, it } from "vitest";
import { generate } from "./angle";

describe("Angle generator", () => {
  it("should generate deg angle", () => {
    const result = generate({ value: 45, unit: "deg" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("45deg");
    }
  });

  it("should generate rad angle", () => {
    const result = generate({ value: 1.5708, unit: "rad" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("1.5708rad");
    }
  });

  it("should generate grad angle", () => {
    const result = generate({ value: 100, unit: "grad" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("100grad");
    }
  });

  it("should generate turn angle", () => {
    const result = generate({ value: 0.25, unit: "turn" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("0.25turn");
    }
  });

  it("should generate zero angle", () => {
    const result = generate({ value: 0, unit: "deg" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("0deg");
    }
  });

  it("should generate negative angle", () => {
    const result = generate({ value: -45, unit: "deg" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("-45deg");
    }
  });
});
