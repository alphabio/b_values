// b_path:: packages/b_utils/src/parse/color/rgb.test.ts
import { describe, expect, it } from "vitest";
import { parseRgbFunction } from "./rgb";
import { extractFunctionFromValue } from "../../../b_utils/src/parse/test-utils";

function parseRgb(input: string) {
  const func = extractFunctionFromValue(input);
  return parseRgbFunction(func);
}

describe("parseRgbFunction", () => {
  describe("Modern syntax (space-separated)", () => {
    it("should parse rgb(255 0 0)", () => {
      const result = parseRgb("rgb(255 0 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.kind).toBe("rgb");
      expect(result.value?.r).toEqual({ kind: "literal", value: 255 });
      expect(result.value?.g).toEqual({ kind: "literal", value: 0 });
      expect(result.value?.b).toEqual({ kind: "literal", value: 0 });
      expect(result.value?.alpha).toBeUndefined();
    });

    it("should parse rgb(255 0 0 / 0.5)", () => {
      const result = parseRgb("rgb(255 0 0 / 0.5)");
      expect(result.ok).toBe(true);
      expect(result.value?.kind).toBe("rgb");
      expect(result.value?.r).toEqual({ kind: "literal", value: 255 });
      expect(result.value?.g).toEqual({ kind: "literal", value: 0 });
      expect(result.value?.b).toEqual({ kind: "literal", value: 0 });
      expect(result.value?.alpha).toEqual({ kind: "literal", value: 0.5 });
    });

    it("should parse rgb(0 0 0)", () => {
      const result = parseRgb("rgb(0 0 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.r).toEqual({ kind: "literal", value: 0 });
      expect(result.value?.g).toEqual({ kind: "literal", value: 0 });
      expect(result.value?.b).toEqual({ kind: "literal", value: 0 });
    });

    it("should parse rgb(255 255 255)", () => {
      const result = parseRgb("rgb(255 255 255)");
      expect(result.ok).toBe(true);
      expect(result.value?.r).toEqual({ kind: "literal", value: 255 });
      expect(result.value?.g).toEqual({ kind: "literal", value: 255 });
      expect(result.value?.b).toEqual({ kind: "literal", value: 255 });
    });

    it("should parse rgb with percentages", () => {
      const result = parseRgb("rgb(100% 50% 0%)");
      expect(result.ok).toBe(true);
      expect(result.value?.r).toEqual({ kind: "literal", value: 100, unit: "%" });
      expect(result.value?.g).toEqual({ kind: "literal", value: 50, unit: "%" });
      expect(result.value?.b).toEqual({ kind: "literal", value: 0, unit: "%" });
    });

    it("should parse rgb with percentage alpha", () => {
      const result = parseRgb("rgb(255 0 0 / 50%)");
      expect(result.ok).toBe(true);
      expect(result.value?.alpha).toEqual({ kind: "literal", value: 50, unit: "%" });
    });
  });

  describe("Legacy syntax (comma-separated)", () => {
    it("should parse rgb(255, 0, 0)", () => {
      const result = parseRgb("rgb(255, 0, 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.r).toEqual({ kind: "literal", value: 255 });
      expect(result.value?.g).toEqual({ kind: "literal", value: 0 });
      expect(result.value?.b).toEqual({ kind: "literal", value: 0 });
      expect(result.value?.alpha).toBeUndefined();
    });

    it("should parse rgba(255, 0, 0, 0.5)", () => {
      const result = parseRgb("rgba(255, 0, 0, 0.5)");
      expect(result.ok).toBe(true);
      expect(result.value?.r).toEqual({ kind: "literal", value: 255 });
      expect(result.value?.g).toEqual({ kind: "literal", value: 0 });
      expect(result.value?.b).toEqual({ kind: "literal", value: 0 });
      expect(result.value?.alpha).toEqual({ kind: "literal", value: 0.5 });
    });

    it("should parse rgba with percentages", () => {
      const result = parseRgb("rgba(100%, 50%, 0%, 0.5)");
      expect(result.ok).toBe(true);
      expect(result.value?.r).toEqual({ kind: "literal", value: 100, unit: "%" });
      expect(result.value?.g).toEqual({ kind: "literal", value: 50, unit: "%" });
      expect(result.value?.b).toEqual({ kind: "literal", value: 0, unit: "%" });
      expect(result.value?.alpha).toEqual({ kind: "literal", value: 0.5 });
    });
  });

  describe("Keywords", () => {
    it("should parse rgb(none none none)", () => {
      const result = parseRgb("rgb(none none none)");
      expect(result.ok).toBe(true);
      expect(result.value?.r).toEqual({ kind: "keyword", value: "none" });
      expect(result.value?.g).toEqual({ kind: "keyword", value: "none" });
      expect(result.value?.b).toEqual({ kind: "keyword", value: "none" });
    });

    it("should parse mixed values and keywords", () => {
      const result = parseRgb("rgb(255 none 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.r).toEqual({ kind: "literal", value: 255 });
      expect(result.value?.g).toEqual({ kind: "keyword", value: "none" });
      expect(result.value?.b).toEqual({ kind: "literal", value: 0 });
    });
  });

  describe("Decimal values", () => {
    it("should parse rgb with decimal values", () => {
      const result = parseRgb("rgb(255.5 128.3 64.7)");
      expect(result.ok).toBe(true);
      expect(result.value?.r).toEqual({ kind: "literal", value: 255.5 });
      expect(result.value?.g).toEqual({ kind: "literal", value: 128.3 });
      expect(result.value?.b).toEqual({ kind: "literal", value: 64.7 });
    });

    it("should parse rgb with decimal alpha", () => {
      const result = parseRgb("rgb(255 0 0 / 0.333)");
      expect(result.ok).toBe(true);
      expect(result.value?.alpha).toEqual({ kind: "literal", value: 0.333 });
    });
  });

  describe("Edge cases", () => {
    it("should parse rgb with zero alpha", () => {
      const result = parseRgb("rgb(255 0 0 / 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.alpha).toEqual({ kind: "literal", value: 0 });
    });

    it("should parse rgb with full alpha", () => {
      const result = parseRgb("rgb(255 0 0 / 1)");
      expect(result.ok).toBe(true);
      expect(result.value?.alpha).toEqual({ kind: "literal", value: 1 });
    });

    it("should parse negative values", () => {
      const result = parseRgb("rgb(-10 -20 -30)");
      expect(result.ok).toBe(true);
      expect(result.value?.r).toEqual({ kind: "literal", value: -10 });
      expect(result.value?.g).toEqual({ kind: "literal", value: -20 });
      expect(result.value?.b).toEqual({ kind: "literal", value: -30 });
    });

    it("should parse values over 255", () => {
      const result = parseRgb("rgb(300 400 500)");
      expect(result.ok).toBe(true);
      expect(result.value?.r).toEqual({ kind: "literal", value: 300 });
      expect(result.value?.g).toEqual({ kind: "literal", value: 400 });
      expect(result.value?.b).toEqual({ kind: "literal", value: 500 });
    });
  });

  describe("Error cases", () => {
    it("should return error for wrong function name", () => {
      const func = extractFunctionFromValue("hsl(0 0% 0%)");
      const result = parseRgbFunction(func);
      expect(result.ok).toBe(false);
      expect(result.error).toContain("Expected rgb()");
    });

    it("should return error for too few values", () => {
      const func = extractFunctionFromValue("rgb(255 0)");
      const result = parseRgbFunction(func);
      expect(result.ok).toBe(false);
      expect(result.error).toContain("must have 3 or 4 values");
    });

    it("should return error for too many values", () => {
      const func = extractFunctionFromValue("rgb(255 0 0 0.5 0.5)");
      const result = parseRgbFunction(func);
      expect(result.ok).toBe(false);
      expect(result.error).toContain("must have 3 or 4 values");
    });
  });
});
