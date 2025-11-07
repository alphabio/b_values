// b_path:: packages/b_keywords/src/color-space.test.ts
import { describe, it, expect } from "vitest";
import { colorFunctionSpace } from "./color-space";

describe("Color Function Space Schema", () => {
  describe("Valid color spaces", () => {
    it("accepts 'srgb'", () => {
      const result = colorFunctionSpace.safeParse("srgb");
      expect(result.success).toBe(true);
    });

    it("accepts 'srgb-linear'", () => {
      const result = colorFunctionSpace.safeParse("srgb-linear");
      expect(result.success).toBe(true);
    });

    it("accepts 'display-p3'", () => {
      const result = colorFunctionSpace.safeParse("display-p3");
      expect(result.success).toBe(true);
    });

    it("accepts 'a98-rgb'", () => {
      const result = colorFunctionSpace.safeParse("a98-rgb");
      expect(result.success).toBe(true);
    });

    it("accepts 'prophoto-rgb'", () => {
      const result = colorFunctionSpace.safeParse("prophoto-rgb");
      expect(result.success).toBe(true);
    });

    it("accepts 'rec2020'", () => {
      const result = colorFunctionSpace.safeParse("rec2020");
      expect(result.success).toBe(true);
    });

    it("accepts 'xyz'", () => {
      const result = colorFunctionSpace.safeParse("xyz");
      expect(result.success).toBe(true);
    });

    it("accepts 'xyz-d50'", () => {
      const result = colorFunctionSpace.safeParse("xyz-d50");
      expect(result.success).toBe(true);
    });

    it("accepts 'xyz-d65'", () => {
      const result = colorFunctionSpace.safeParse("xyz-d65");
      expect(result.success).toBe(true);
    });
  });

  describe("Invalid color spaces", () => {
    it("rejects 'rgb'", () => {
      const result = colorFunctionSpace.safeParse("rgb");
      expect(result.success).toBe(false);
    });

    it("rejects 'hsl'", () => {
      const result = colorFunctionSpace.safeParse("hsl");
      expect(result.success).toBe(false);
    });

    it("rejects 'hwb'", () => {
      const result = colorFunctionSpace.safeParse("hwb");
      expect(result.success).toBe(false);
    });

    it("rejects 'lab'", () => {
      const result = colorFunctionSpace.safeParse("lab");
      expect(result.success).toBe(false);
    });

    it("rejects 'lch'", () => {
      const result = colorFunctionSpace.safeParse("lch");
      expect(result.success).toBe(false);
    });

    it("rejects 'oklch'", () => {
      const result = colorFunctionSpace.safeParse("oklch");
      expect(result.success).toBe(false);
    });

    it("rejects 'oklab'", () => {
      const result = colorFunctionSpace.safeParse("oklab");
      expect(result.success).toBe(false);
    });

    it("rejects empty string", () => {
      const result = colorFunctionSpace.safeParse("");
      expect(result.success).toBe(false);
    });

    it("rejects unknown space", () => {
      const result = colorFunctionSpace.safeParse("cmyk");
      expect(result.success).toBe(false);
    });

    it("rejects number", () => {
      const result = colorFunctionSpace.safeParse(42);
      expect(result.success).toBe(false);
    });

    it("rejects null", () => {
      const result = colorFunctionSpace.safeParse(null);
      expect(result.success).toBe(false);
    });

    it("rejects undefined", () => {
      const result = colorFunctionSpace.safeParse(undefined);
      expect(result.success).toBe(false);
    });
  });

  describe("Case sensitivity", () => {
    it("rejects uppercase 'SRGB'", () => {
      const result = colorFunctionSpace.safeParse("SRGB");
      expect(result.success).toBe(false);
    });

    it("rejects mixed case 'Display-P3'", () => {
      const result = colorFunctionSpace.safeParse("Display-P3");
      expect(result.success).toBe(false);
    });

    it("rejects 'XYZ' uppercase", () => {
      const result = colorFunctionSpace.safeParse("XYZ");
      expect(result.success).toBe(false);
    });
  });
});
