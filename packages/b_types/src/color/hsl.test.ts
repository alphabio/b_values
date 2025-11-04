// b_path:: packages/b_types/src/color/hsl.test.ts
import { describe, expect, it } from "vitest";
import { hslColorSchema } from "./hsl";

const lit = (value: number) => ({ kind: "literal" as const, value });

describe("hslColorSchema", () => {
  it("validates opaque HSL colors", () => {
    const result = hslColorSchema.safeParse({
      kind: "hsl",
      h: lit(120),
      s: lit(100),
      l: lit(50),
    });
    expect(result.success).toBe(true);
  });

  it("validates HSL colors with alpha", () => {
    const result = hslColorSchema.safeParse({
      kind: "hsl",
      h: lit(120),
      s: lit(100),
      l: lit(50),
      alpha: lit(0.5),
    });
    expect(result.success).toBe(true);
  });

  it("allows hue wrapping (negative values)", () => {
    const result = hslColorSchema.safeParse({
      kind: "hsl",
      h: lit(-30),
      s: lit(50),
      l: lit(50),
    });
    expect(result.success).toBe(true);
  });

  it("allows hue wrapping (values above 360)", () => {
    const result = hslColorSchema.safeParse({
      kind: "hsl",
      h: lit(420),
      s: lit(50),
      l: lit(50),
    });
    expect(result.success).toBe(true);
  });

  it("rejects wrong kind", () => {
    const result = hslColorSchema.safeParse({
      kind: "rgb",
      h: lit(120),
      s: lit(100),
      l: lit(50),
    });
    expect(result.success).toBe(false);
  });
});
