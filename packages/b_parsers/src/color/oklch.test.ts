// b_path:: packages/b_utils/src/parse/color/oklch.test.ts
import { describe, expect, it } from "vitest";
import { parseOklchFunction } from "./oklch";
import { extractFunctionFromValue } from "../../../b_utils/src/parse/test-helpers";

function parseOklch(input: string) {
  const func = extractFunctionFromValue(input);
  return parseOklchFunction(func);
}

describe("parseOklchFunction", () => {
  describe("Basic syntax", () => {
    it("should parse oklch(0.5 0.15 180)", () => {
      const result = parseOklch("oklch(0.5 0.15 180)");
      expect(result.ok).toBe(true);
      expect(result.value?.kind).toBe("oklch");
      expect(result.value?.l).toEqual({ kind: "literal", value: 0.5 });
      expect(result.value?.c).toEqual({ kind: "literal", value: 0.15 });
      expect(result.value?.h).toEqual({ kind: "literal", value: 180 });
      expect(result.value?.alpha).toBeUndefined();
    });

    it("should parse oklch with alpha", () => {
      const result = parseOklch("oklch(0.5 0.15 180 / 0.5)");
      expect(result.ok).toBe(true);
      expect(result.value?.alpha).toEqual({ kind: "literal", value: 0.5 });
    });

    it("should parse oklch with percentage lightness", () => {
      const result = parseOklch("oklch(50% 0.15 180)");
      expect(result.ok).toBe(true);
      expect(result.value?.l).toEqual({ kind: "literal", value: 50, unit: "%" });
    });

    it("should parse oklch with hue in degrees", () => {
      const result = parseOklch("oklch(0.5 0.15 180deg)");
      expect(result.ok).toBe(true);
      expect(result.value?.h).toEqual({ kind: "literal", value: 180, unit: "deg" });
    });

    it("should parse oklch(0 0 0) - black", () => {
      const result = parseOklch("oklch(0 0 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.l).toEqual({ kind: "literal", value: 0 });
      expect(result.value?.c).toEqual({ kind: "literal", value: 0 });
      expect(result.value?.h).toEqual({ kind: "literal", value: 0 });
    });

    it("should parse oklch(1 0 0) - white", () => {
      const result = parseOklch("oklch(1 0 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.l).toEqual({ kind: "literal", value: 1 });
    });
  });

  describe("Angle units", () => {
    it("should parse oklch with rad unit", () => {
      const result = parseOklch("oklch(0.5 0.15 3.14rad)");
      expect(result.ok).toBe(true);
      expect(result.value?.h).toEqual({ kind: "literal", value: 3.14, unit: "rad" });
    });

    it("should parse oklch with turn unit", () => {
      const result = parseOklch("oklch(0.5 0.15 0.5turn)");
      expect(result.ok).toBe(true);
      expect(result.value?.h).toEqual({ kind: "literal", value: 0.5, unit: "turn" });
    });

    it("should parse oklch with grad unit", () => {
      const result = parseOklch("oklch(0.5 0.15 200grad)");
      expect(result.ok).toBe(true);
      expect(result.value?.h).toEqual({ kind: "literal", value: 200, unit: "grad" });
    });
  });

  describe("Keywords", () => {
    it("should parse oklch(none none none)", () => {
      const result = parseOklch("oklch(none none none)");
      expect(result.ok).toBe(true);
      expect(result.value?.l).toEqual({ kind: "keyword", value: "none" });
      expect(result.value?.c).toEqual({ kind: "keyword", value: "none" });
      expect(result.value?.h).toEqual({ kind: "keyword", value: "none" });
    });

    it("should parse mixed values and keywords", () => {
      const result = parseOklch("oklch(0.5 none 180)");
      expect(result.ok).toBe(true);
      expect(result.value?.l).toEqual({ kind: "literal", value: 0.5 });
      expect(result.value?.c).toEqual({ kind: "keyword", value: "none" });
      expect(result.value?.h).toEqual({ kind: "literal", value: 180 });
    });
  });

  describe("Edge cases", () => {
    it("should parse oklch with percentage alpha", () => {
      const result = parseOklch("oklch(0.5 0.15 180 / 75%)");
      expect(result.ok).toBe(true);
      expect(result.value?.alpha).toEqual({ kind: "literal", value: 75, unit: "%" });
    });

    it("should parse oklch with zero alpha", () => {
      const result = parseOklch("oklch(0.5 0.15 180 / 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.alpha).toEqual({ kind: "literal", value: 0 });
    });

    it("should parse oklch with precise decimal values", () => {
      const result = parseOklch("oklch(0.54321 0.12345 123.456)");
      expect(result.ok).toBe(true);
      expect(result.value?.l).toEqual({ kind: "literal", value: 0.54321 });
      expect(result.value?.c).toEqual({ kind: "literal", value: 0.12345 });
      expect(result.value?.h).toEqual({ kind: "literal", value: 123.456 });
    });
  });
});
