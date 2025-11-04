// b_path:: packages/b_types/src/color/hwb.test.ts
import { describe, expect, it } from "vitest";
import { hwbColorSchema } from "./hwb";

const lit = (value: number) => ({ kind: "literal" as const, value });

describe("hwbColorSchema", () => {
  it("validates opaque HWB colors", () => {
    const result = hwbColorSchema.safeParse({
      kind: "hwb",
      h: lit(120),
      w: lit(20),
      b: lit(30),
    });
    expect(result.success).toBe(true);
  });

  it("validates HWB colors with alpha", () => {
    const result = hwbColorSchema.safeParse({
      kind: "hwb",
      h: lit(120),
      w: lit(20),
      b: lit(30),
      alpha: lit(0.5),
    });
    expect(result.success).toBe(true);
  });

  it("allows hue wrapping (negative values)", () => {
    const result = hwbColorSchema.safeParse({
      kind: "hwb",
      h: lit(-30),
      w: lit(20),
      b: lit(30),
    });
    expect(result.success).toBe(true);
  });

  it("allows hue wrapping (values above 360)", () => {
    const result = hwbColorSchema.safeParse({
      kind: "hwb",
      h: lit(420),
      w: lit(20),
      b: lit(30),
    });
    expect(result.success).toBe(true);
  });

  it("rejects wrong kind", () => {
    const result = hwbColorSchema.safeParse({
      kind: "hsl",
      h: lit(120),
      w: lit(20),
      b: lit(30),
    });
    expect(result.success).toBe(false);
  });
});
