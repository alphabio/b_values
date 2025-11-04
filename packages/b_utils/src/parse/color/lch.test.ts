// b_path:: packages/b_utils/src/parse/color/lch.test.ts
import { describe, expect, it } from "vitest";
import { parseLchFunction } from "./lch";
import { colorFunctionFromDeclaration } from "./test-helpers";

function parseLch(input: string) {
  const func = colorFunctionFromDeclaration(input);
  return parseLchFunction(func);
}

describe("parseLchFunction", () => {
  describe("Basic syntax", () => {
    it("should parse lch(50% 50 180)", () => {
      const result = parseLch("lch(50% 50 180)");
      expect(result.ok).toBe(true);
      expect(result.value?.kind).toBe("lch");
      expect(result.value?.l).toEqual({ kind: "literal", value: 50, unit: "%" });
      expect(result.value?.c).toEqual({ kind: "literal", value: 50 });
      expect(result.value?.h).toEqual({ kind: "literal", value: 180 });
      expect(result.value?.alpha).toBeUndefined();
    });

    it("should parse lch with alpha", () => {
      const result = parseLch("lch(50% 50 180 / 0.5)");
      expect(result.ok).toBe(true);
      expect(result.value?.alpha).toEqual({ kind: "literal", value: 0.5 });
    });

    it("should parse lch with hue in degrees", () => {
      const result = parseLch("lch(50% 50 180deg)");
      expect(result.ok).toBe(true);
      expect(result.value?.h).toEqual({ kind: "literal", value: 180, unit: "deg" });
    });

    it("should parse lch(0% 0 0) - black", () => {
      const result = parseLch("lch(0% 0 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.l).toEqual({ kind: "literal", value: 0, unit: "%" });
      expect(result.value?.c).toEqual({ kind: "literal", value: 0 });
      expect(result.value?.h).toEqual({ kind: "literal", value: 0 });
    });

    it("should parse lch(100% 0 0) - white", () => {
      const result = parseLch("lch(100% 0 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.l).toEqual({ kind: "literal", value: 100, unit: "%" });
    });
  });

  describe("Angle units", () => {
    it("should parse lch with rad unit", () => {
      const result = parseLch("lch(50% 50 3.14rad)");
      expect(result.ok).toBe(true);
      expect(result.value?.h).toEqual({ kind: "literal", value: 3.14, unit: "rad" });
    });

    it("should parse lch with turn unit", () => {
      const result = parseLch("lch(50% 50 0.5turn)");
      expect(result.ok).toBe(true);
      expect(result.value?.h).toEqual({ kind: "literal", value: 0.5, unit: "turn" });
    });

    it("should parse lch with grad unit", () => {
      const result = parseLch("lch(50% 50 200grad)");
      expect(result.ok).toBe(true);
      expect(result.value?.h).toEqual({ kind: "literal", value: 200, unit: "grad" });
    });
  });

  describe("Keywords", () => {
    it("should parse lch(none none none)", () => {
      const result = parseLch("lch(none none none)");
      expect(result.ok).toBe(true);
      expect(result.value?.l).toEqual({ kind: "keyword", value: "none" });
      expect(result.value?.c).toEqual({ kind: "keyword", value: "none" });
      expect(result.value?.h).toEqual({ kind: "keyword", value: "none" });
    });

    it("should parse mixed values and keywords", () => {
      const result = parseLch("lch(50% none 180)");
      expect(result.ok).toBe(true);
      expect(result.value?.l).toEqual({ kind: "literal", value: 50, unit: "%" });
      expect(result.value?.c).toEqual({ kind: "keyword", value: "none" });
      expect(result.value?.h).toEqual({ kind: "literal", value: 180 });
    });
  });

  describe("Edge cases", () => {
    it("should parse lch with percentage alpha", () => {
      const result = parseLch("lch(50% 50 180 / 75%)");
      expect(result.ok).toBe(true);
      expect(result.value?.alpha).toEqual({ kind: "literal", value: 75, unit: "%" });
    });

    it("should parse lch with zero alpha", () => {
      const result = parseLch("lch(50% 50 180 / 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.alpha).toEqual({ kind: "literal", value: 0 });
    });

    it("should parse lch with decimal values", () => {
      const result = parseLch("lch(54.3% 47.5 123.4)");
      expect(result.ok).toBe(true);
      expect(result.value?.l).toEqual({ kind: "literal", value: 54.3, unit: "%" });
      expect(result.value?.c).toEqual({ kind: "literal", value: 47.5 });
      expect(result.value?.h).toEqual({ kind: "literal", value: 123.4 });
    });
  });
});

describe("parseLchFunction - Error cases", () => {
  it("should return error for wrong function name", () => {
    const func = colorFunctionFromDeclaration("rgb(0 0 0)");
    const result = parseLchFunction(func);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Expected lch()");
    }
  });

  it("should return error for too few values", () => {
    const func = colorFunctionFromDeclaration("lch(50% 50)");
    const result = parseLchFunction(func);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("must have 3 or 4 values");
    }
  });
});
