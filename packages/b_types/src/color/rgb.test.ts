// b_path:: packages/b_types/src/color/rgb.test.ts
import { describe, expect, it } from "vitest";
import { rgbColorSchema } from "./rgb";

describe("rgbColorSchema", () => {
  it("validates opaque RGB colors", () => {
    const result = rgbColorSchema.safeParse({
      kind: "rgb",
      r: 255,
      g: 87,
      b: 51,
    });
    expect(result.success).toBe(true);
  });

  it("validates RGB colors with alpha", () => {
    const result = rgbColorSchema.safeParse({
      kind: "rgb",
      r: 255,
      g: 87,
      b: 51,
      alpha: 0.5,
    });
    expect(result.success).toBe(true);
  });

  it("validates alpha of 0", () => {
    const result = rgbColorSchema.safeParse({
      kind: "rgb",
      r: 0,
      g: 0,
      b: 0,
      alpha: 0,
    });
    expect(result.success).toBe(true);
  });

  it("validates alpha of 1", () => {
    const result = rgbColorSchema.safeParse({
      kind: "rgb",
      r: 255,
      g: 255,
      b: 255,
      alpha: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects wrong kind", () => {
    const result = rgbColorSchema.safeParse({
      kind: "hsl",
      r: 255,
      g: 87,
      b: 51,
    });
    expect(result.success).toBe(false);
  });
});
