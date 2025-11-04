// b_path:: packages/b_types/src/color/rgb.test.ts
import { describe, expect, it } from "vitest";
import { rgbColorSchema } from "./rgb";

const lit = (value: number) => ({ kind: "literal" as const, value });

describe("rgbColorSchema", () => {
  it("validates opaque RGB colors", () => {
    const result = rgbColorSchema.safeParse({
      kind: "rgb",
      r: lit(255),
      g: lit(87),
      b: lit(51),
    });
    expect(result.success).toBe(true);
  });

  it("validates RGB colors with alpha", () => {
    const result = rgbColorSchema.safeParse({
      kind: "rgb",
      r: lit(255),
      g: lit(87),
      b: lit(51),
      alpha: lit(0.5),
    });
    expect(result.success).toBe(true);
  });

  it("validates alpha of 0", () => {
    const result = rgbColorSchema.safeParse({
      kind: "rgb",
      r: lit(0),
      g: lit(0),
      b: lit(0),
      alpha: lit(0),
    });
    expect(result.success).toBe(true);
  });

  it("validates alpha of 1", () => {
    const result = rgbColorSchema.safeParse({
      kind: "rgb",
      r: lit(255),
      g: lit(255),
      b: lit(255),
      alpha: lit(1),
    });
    expect(result.success).toBe(true);
  });

  it("rejects wrong kind", () => {
    const result = rgbColorSchema.safeParse({
      kind: "hsl",
      r: lit(255),
      g: lit(87),
      b: lit(51),
    });
    expect(result.success).toBe(false);
  });
});
