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

  it("rejects r values below 0", () => {
    const result = rgbColorSchema.safeParse({
      kind: "rgb",
      r: -1,
      g: 100,
      b: 100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects r values above 255", () => {
    const result = rgbColorSchema.safeParse({
      kind: "rgb",
      r: 256,
      g: 100,
      b: 100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects g values below 0", () => {
    const result = rgbColorSchema.safeParse({
      kind: "rgb",
      r: 100,
      g: -1,
      b: 100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects g values above 255", () => {
    const result = rgbColorSchema.safeParse({
      kind: "rgb",
      r: 100,
      g: 256,
      b: 100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects b values below 0", () => {
    const result = rgbColorSchema.safeParse({
      kind: "rgb",
      r: 100,
      g: 100,
      b: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects b values above 255", () => {
    const result = rgbColorSchema.safeParse({
      kind: "rgb",
      r: 100,
      g: 100,
      b: 256,
    });
    expect(result.success).toBe(false);
  });

  it("rejects alpha below 0", () => {
    const result = rgbColorSchema.safeParse({
      kind: "rgb",
      r: 100,
      g: 100,
      b: 100,
      alpha: -0.1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects alpha above 1", () => {
    const result = rgbColorSchema.safeParse({
      kind: "rgb",
      r: 100,
      g: 100,
      b: 100,
      alpha: 1.1,
    });
    expect(result.success).toBe(false);
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
