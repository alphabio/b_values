// b_path:: packages/b_utils/src/parse/color/hsl.test.ts
import { describe, expect, it } from "vitest";
import { parseHslFunction } from "./hsl";
import { extractFunctionFromValue } from "../../../b_utils/src/parse/test-helpers";

function parseHsl(input: string) {
  const func = extractFunctionFromValue(input);
  return parseHslFunction(func);
}

describe("parseHslFunction", () => {
  describe("Modern syntax (space-separated)", () => {
    it("should parse hsl(180deg 50% 50%)", () => {
      const result = parseHsl("hsl(180deg 50% 50%)");
      expect(result.ok).toBe(true);
      expect(result.value?.kind).toBe("hsl");
      expect(result.value?.h).toEqual({ kind: "literal", value: 180, unit: "deg" });
      expect(result.value?.s).toEqual({ kind: "literal", value: 50, unit: "%" });
      expect(result.value?.l).toEqual({ kind: "literal", value: 50, unit: "%" });
      expect(result.value?.alpha).toBeUndefined();
    });

    it("should parse hsl(180deg 50% 50% / 0.5)", () => {
      const result = parseHsl("hsl(180deg 50% 50% / 0.5)");
      expect(result.ok).toBe(true);
      expect(result.value?.alpha).toEqual({ kind: "literal", value: 0.5 });
    });

    it("should parse hsl with unitless hue (number)", () => {
      const result = parseHsl("hsl(180 50% 50%)");
      expect(result.ok).toBe(true);
      expect(result.value?.h).toEqual({ kind: "literal", value: 180 });
    });

    it("should parse hsl with rad unit", () => {
      const result = parseHsl("hsl(3.14rad 50% 50%)");
      expect(result.ok).toBe(true);
      expect(result.value?.h).toEqual({ kind: "literal", value: 3.14, unit: "rad" });
    });

    it("should parse hsl with turn unit", () => {
      const result = parseHsl("hsl(0.5turn 50% 50%)");
      expect(result.ok).toBe(true);
      expect(result.value?.h).toEqual({ kind: "literal", value: 0.5, unit: "turn" });
    });

    it("should parse hsl with grad unit", () => {
      const result = parseHsl("hsl(200grad 50% 50%)");
      expect(result.ok).toBe(true);
      expect(result.value?.h).toEqual({ kind: "literal", value: 200, unit: "grad" });
    });
  });

  describe("Legacy syntax (comma-separated)", () => {
    it("should parse hsl(180, 50%, 50%)", () => {
      const result = parseHsl("hsl(180, 50%, 50%)");
      expect(result.ok).toBe(true);
      expect(result.value?.h).toEqual({ kind: "literal", value: 180 });
      expect(result.value?.s).toEqual({ kind: "literal", value: 50, unit: "%" });
      expect(result.value?.l).toEqual({ kind: "literal", value: 50, unit: "%" });
    });

    it("should parse hsla(180, 50%, 50%, 0.5)", () => {
      const result = parseHsl("hsla(180, 50%, 50%, 0.5)");
      expect(result.ok).toBe(true);
      expect(result.value?.alpha).toEqual({ kind: "literal", value: 0.5 });
    });
  });

  describe("Keywords", () => {
    it("should parse hsl(none none none)", () => {
      const result = parseHsl("hsl(none none none)");
      expect(result.ok).toBe(true);
      expect(result.value?.h).toEqual({ kind: "keyword", value: "none" });
      expect(result.value?.s).toEqual({ kind: "keyword", value: "none" });
      expect(result.value?.l).toEqual({ kind: "keyword", value: "none" });
    });

    it("should parse mixed values and keywords", () => {
      const result = parseHsl("hsl(180deg none 50%)");
      expect(result.ok).toBe(true);
      expect(result.value?.h).toEqual({ kind: "literal", value: 180, unit: "deg" });
      expect(result.value?.s).toEqual({ kind: "keyword", value: "none" });
      expect(result.value?.l).toEqual({ kind: "literal", value: 50, unit: "%" });
    });
  });

  describe("Edge cases", () => {
    it("should parse hsl(0deg 0% 0%) - black", () => {
      const result = parseHsl("hsl(0deg 0% 0%)");
      expect(result.ok).toBe(true);
      expect(result.value?.h).toEqual({ kind: "literal", value: 0, unit: "deg" });
      expect(result.value?.s).toEqual({ kind: "literal", value: 0, unit: "%" });
      expect(result.value?.l).toEqual({ kind: "literal", value: 0, unit: "%" });
    });

    it("should parse hsl(0deg 0% 100%) - white", () => {
      const result = parseHsl("hsl(0deg 0% 100%)");
      expect(result.ok).toBe(true);
      expect(result.value?.l).toEqual({ kind: "literal", value: 100, unit: "%" });
    });

    it("should parse hsl with zero alpha", () => {
      const result = parseHsl("hsl(180deg 50% 50% / 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.alpha).toEqual({ kind: "literal", value: 0 });
    });

    it("should parse hsl with percentage alpha", () => {
      const result = parseHsl("hsl(180deg 50% 50% / 50%)");
      expect(result.ok).toBe(true);
      expect(result.value?.alpha).toEqual({ kind: "literal", value: 50, unit: "%" });
    });
  });

  describe("Error cases", () => {
    it("should return error for wrong function name", () => {
      const func = extractFunctionFromValue("rgb(0 0 0)");
      const result = parseHslFunction(func);
      expect(result.ok).toBe(false);
      expect(result.error).toContain("Expected hsl()");
    });

    it("should return error for too few values", () => {
      const func = extractFunctionFromValue("hsl(180deg 50%)");
      const result = parseHslFunction(func);
      expect(result.ok).toBe(false);
      expect(result.error).toContain("must have 3 or 4 values");
    });
  });
});
