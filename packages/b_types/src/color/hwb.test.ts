// b_path:: packages/b_types/src/color/hwb.test.ts
import { describe, expect, it } from "vitest";
import { hwbColorSchema } from "./hwb";

describe("hwbColorSchema", () => {
  it("validates opaque HWB colors", () => {
    const result = hwbColorSchema.safeParse({
      kind: "hwb",
      h: 120,
      w: 20,
      b: 30,
    });
    expect(result.success).toBe(true);
  });

  it("validates HWB colors with alpha", () => {
    const result = hwbColorSchema.safeParse({
      kind: "hwb",
      h: 120,
      w: 20,
      b: 30,
      alpha: 0.5,
    });
    expect(result.success).toBe(true);
  });

  it("allows hue wrapping (negative values)", () => {
    const result = hwbColorSchema.safeParse({
      kind: "hwb",
      h: -30,
      w: 20,
      b: 30,
    });
    expect(result.success).toBe(true);
  });

  it("allows hue wrapping (values above 360)", () => {
    const result = hwbColorSchema.safeParse({
      kind: "hwb",
      h: 420,
      w: 20,
      b: 30,
    });
    expect(result.success).toBe(true);
  });

  it("rejects wrong kind", () => {
    const result = hwbColorSchema.safeParse({
      kind: "hsl",
      h: 120,
      w: 20,
      b: 30,
    });
    expect(result.success).toBe(false);
  });
});
