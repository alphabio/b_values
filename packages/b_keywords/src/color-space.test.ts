// b_path:: packages/b_keywords/src/color-space.test.ts
import { describe, it, expect } from "vitest";
import { colorFunctionSpaceSchema } from "./color-space";

describe("Color Function Space Schema", () => {
  describe("Valid color spaces", () => {
    it("accepts 'srgb'", () => {
      const result = colorFunctionSpaceSchema.safeParse("srgb");
      expect(result.success).toBe(true);
    });

    it("accepts 'srgb-linear'", () => {
      const result = colorFunctionSpaceSchema.safeParse("srgb-linear");
      expect(result.success).toBe(true);
    });

    it("accepts 'display-p3'", () => {
      const result = colorFunctionSpaceSchema.safeParse("display-p3");
      expect(result.success).toBe(true);
    });

    it("accepts 'a98-rgb'", () => {
      const result = colorFunctionSpaceSchema.safeParse("a98-rgb");
      expect(result.success).toBe(true);
    });

    it("accepts 'prophoto-rgb'", () => {
      const result = colorFunctionSpaceSchema.safeParse("prophoto-rgb");
      expect(result.success).toBe(true);
    });

    it("accepts 'rec2020'", () => {
      const result = colorFunctionSpaceSchema.safeParse("rec2020");
      expect(result.success).toBe(true);
    });

    it("accepts 'xyz'", () => {
      const result = colorFunctionSpaceSchema.safeParse("xyz");
      expect(result.success).toBe(true);
    });

    it("accepts 'xyz-d50'", () => {
      const result = colorFunctionSpaceSchema.safeParse("xyz-d50");
      expect(result.success).toBe(true);
    });

    it("accepts 'xyz-d65'", () => {
      const result = colorFunctionSpaceSchema.safeParse("xyz-d65");
      expect(result.success).toBe(true);
    });
  });

  describe("Invalid color spaces", () => {
    it("rejects 'rgb'", () => {
      const result = colorFunctionSpaceSchema.safeParse("rgb");
      expect(result.success).toBe(false);
    });

    it("rejects 'hsl'", () => {
      const result = colorFunctionSpaceSchema.safeParse("hsl");
      expect(result.success).toBe(false);
    });

    it("rejects 'hwb'", () => {
      const result = colorFunctionSpaceSchema.safeParse("hwb");
      expect(result.success).toBe(false);
    });

    it("rejects 'lab'", () => {
      const result = colorFunctionSpaceSchema.safeParse("lab");
      expect(result.success).toBe(false);
    });

    it("rejects 'lch'", () => {
      const result = colorFunctionSpaceSchema.safeParse("lch");
      expect(result.success).toBe(false);
    });

    it("rejects 'oklch'", () => {
      const result = colorFunctionSpaceSchema.safeParse("oklch");
      expect(result.success).toBe(false);
    });

    it("rejects 'oklab'", () => {
      const result = colorFunctionSpaceSchema.safeParse("oklab");
      expect(result.success).toBe(false);
    });

    it("rejects empty string", () => {
      const result = colorFunctionSpaceSchema.safeParse("");
      expect(result.success).toBe(false);
    });

    it("rejects unknown space", () => {
      const result = colorFunctionSpaceSchema.safeParse("cmyk");
      expect(result.success).toBe(false);
    });

    it("rejects number", () => {
      const result = colorFunctionSpaceSchema.safeParse(42);
      expect(result.success).toBe(false);
    });

    it("rejects null", () => {
      const result = colorFunctionSpaceSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it("rejects undefined", () => {
      const result = colorFunctionSpaceSchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });
  });

  describe("Case sensitivity", () => {
    it("rejects uppercase 'SRGB'", () => {
      const result = colorFunctionSpaceSchema.safeParse("SRGB");
      expect(result.success).toBe(false);
    });

    it("rejects mixed case 'Display-P3'", () => {
      const result = colorFunctionSpaceSchema.safeParse("Display-P3");
      expect(result.success).toBe(false);
    });

    it("rejects 'XYZ' uppercase", () => {
      const result = colorFunctionSpaceSchema.safeParse("XYZ");
      expect(result.success).toBe(false);
    });
  });
});
