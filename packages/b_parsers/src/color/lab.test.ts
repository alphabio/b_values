// b_path:: packages/b_utils/src/parse/color/lab.test.ts
import { describe, expect, it } from "vitest";
import { parseLabFunction } from "./lab";
import { extractFunctionFromValue } from "../../../b_utils/src/parse/test-helpers";

function parseLab(input: string) {
  const func = extractFunctionFromValue(input);
  return parseLabFunction(func);
}

describe("parseLabFunction", () => {
  describe("Basic syntax", () => {
    it("should parse lab(50% 25 -25)", () => {
      const result = parseLab("lab(50% 25 -25)");
      expect(result.ok).toBe(true);
      expect(result.value?.kind).toBe("lab");
      expect(result.value?.l).toEqual({ kind: "literal", value: 50, unit: "%" });
      expect(result.value?.a).toEqual({ kind: "literal", value: 25 });
      expect(result.value?.b).toEqual({ kind: "literal", value: -25 });
      expect(result.value?.alpha).toBeUndefined();
    });

    it("should parse lab with alpha", () => {
      const result = parseLab("lab(50% 25 -25 / 0.5)");
      expect(result.ok).toBe(true);
      expect(result.value?.alpha).toEqual({ kind: "literal", value: 0.5 });
    });

    it("should parse lab(0% 0 0) - black", () => {
      const result = parseLab("lab(0% 0 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.l).toEqual({ kind: "literal", value: 0, unit: "%" });
      expect(result.value?.a).toEqual({ kind: "literal", value: 0 });
      expect(result.value?.b).toEqual({ kind: "literal", value: 0 });
    });

    it("should parse lab(100% 0 0) - white", () => {
      const result = parseLab("lab(100% 0 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.l).toEqual({ kind: "literal", value: 100, unit: "%" });
    });
  });

  describe("Numeric lightness", () => {
    it("should parse lab with numeric lightness", () => {
      const result = parseLab("lab(50 25 -25)");
      expect(result.ok).toBe(true);
      expect(result.value?.l).toEqual({ kind: "literal", value: 50 });
    });
  });

  describe("Keywords", () => {
    it("should parse lab(none none none)", () => {
      const result = parseLab("lab(none none none)");
      expect(result.ok).toBe(true);
      expect(result.value?.l).toEqual({ kind: "keyword", value: "none" });
      expect(result.value?.a).toEqual({ kind: "keyword", value: "none" });
      expect(result.value?.b).toEqual({ kind: "keyword", value: "none" });
    });

    it("should parse mixed values and keywords", () => {
      const result = parseLab("lab(50% none -25)");
      expect(result.ok).toBe(true);
      expect(result.value?.l).toEqual({ kind: "literal", value: 50, unit: "%" });
      expect(result.value?.a).toEqual({ kind: "keyword", value: "none" });
      expect(result.value?.b).toEqual({ kind: "literal", value: -25 });
    });
  });

  describe("Edge cases", () => {
    it("should parse lab with percentage alpha", () => {
      const result = parseLab("lab(50% 25 -25 / 75%)");
      expect(result.ok).toBe(true);
      expect(result.value?.alpha).toEqual({ kind: "literal", value: 75, unit: "%" });
    });

    it("should parse lab with zero alpha", () => {
      const result = parseLab("lab(50% 25 -25 / 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.alpha).toEqual({ kind: "literal", value: 0 });
    });

    it("should parse lab with decimal values", () => {
      const result = parseLab("lab(54.3% 12.7 -10.2)");
      expect(result.ok).toBe(true);
      expect(result.value?.l).toEqual({ kind: "literal", value: 54.3, unit: "%" });
      expect(result.value?.a).toEqual({ kind: "literal", value: 12.7 });
      expect(result.value?.b).toEqual({ kind: "literal", value: -10.2 });
    });
  });
});

describe("parseLabFunction - Error cases", () => {
  it("should return error for wrong function name", () => {
    const func = extractFunctionFromValue("rgb(0 0 0)");
    const result = parseLabFunction(func);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Expected lab()");
    }
  });

  it("should return error for too few values", () => {
    const func = extractFunctionFromValue("lab(50% 25)");
    const result = parseLabFunction(func);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("must have 3 or 4 values");
    }
  });
});
