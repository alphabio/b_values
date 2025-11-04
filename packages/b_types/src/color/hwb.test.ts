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

  it("rejects whiteness below 0", () => {
    const result = hwbColorSchema.safeParse({
      kind: "hwb",
      h: 120,
      w: -1,
      b: 30,
    });
    expect(result.success).toBe(false);
  });

  it("rejects whiteness above 100", () => {
    const result = hwbColorSchema.safeParse({
      kind: "hwb",
      h: 120,
      w: 101,
      b: 30,
    });
    expect(result.success).toBe(false);
  });

  it("rejects blackness below 0", () => {
    const result = hwbColorSchema.safeParse({
      kind: "hwb",
      h: 120,
      w: 20,
      b: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects blackness above 100", () => {
    const result = hwbColorSchema.safeParse({
      kind: "hwb",
      h: 120,
      w: 20,
      b: 101,
    });
    expect(result.success).toBe(false);
  });

  it("rejects alpha below 0", () => {
    const result = hwbColorSchema.safeParse({
      kind: "hwb",
      h: 120,
      w: 20,
      b: 30,
      alpha: -0.1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects alpha above 1", () => {
    const result = hwbColorSchema.safeParse({
      kind: "hwb",
      h: 120,
      w: 20,
      b: 30,
      alpha: 1.1,
    });
    expect(result.success).toBe(false);
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
