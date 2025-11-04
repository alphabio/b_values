// b_path:: packages/b_utils/src/parse/color/hwb.test.ts
import { describe, expect, it } from "vitest";
import { parseHwbFunction } from "./hwb";
import { extractFunctionFromValue } from "../../../b_utils/src/parse/test-utils";

function parseHwb(input: string) {
  const func = extractFunctionFromValue(input);
  return parseHwbFunction(func);
}

describe("parseHwbFunction", () => {
  describe("Basic syntax", () => {
    it("should parse hwb(120 20% 30%)", () => {
      const result = parseHwb("hwb(120 20% 30%)");
      expect(result.ok).toBe(true);
      expect(result.value?.kind).toBe("hwb");
      expect(result.value?.h).toEqual({ kind: "literal", value: 120 });
      expect(result.value?.w).toEqual({ kind: "literal", value: 20, unit: "%" });
      expect(result.value?.b).toEqual({ kind: "literal", value: 30, unit: "%" });
      expect(result.value?.alpha).toBeUndefined();
    });

    it("should parse hwb(120deg 20% 30%)", () => {
      const result = parseHwb("hwb(120deg 20% 30%)");
      expect(result.ok).toBe(true);
      expect(result.value?.h).toEqual({ kind: "literal", value: 120, unit: "deg" });
    });

    it("should parse hwb with alpha", () => {
      const result = parseHwb("hwb(120 20% 30% / 0.5)");
      expect(result.ok).toBe(true);
      expect(result.value?.alpha).toEqual({ kind: "literal", value: 0.5 });
    });

    it("should parse hwb(0 0% 0%) - red", () => {
      const result = parseHwb("hwb(0 0% 0%)");
      expect(result.ok).toBe(true);
      expect(result.value?.h).toEqual({ kind: "literal", value: 0 });
      expect(result.value?.w).toEqual({ kind: "literal", value: 0, unit: "%" });
      expect(result.value?.b).toEqual({ kind: "literal", value: 0, unit: "%" });
    });

    it("should parse hwb(0 100% 0%) - white", () => {
      const result = parseHwb("hwb(0 100% 0%)");
      expect(result.ok).toBe(true);
      expect(result.value?.w).toEqual({ kind: "literal", value: 100, unit: "%" });
    });

    it("should parse hwb(0 0% 100%) - black", () => {
      const result = parseHwb("hwb(0 0% 100%)");
      expect(result.ok).toBe(true);
      expect(result.value?.b).toEqual({ kind: "literal", value: 100, unit: "%" });
    });
  });

  describe("Angle units", () => {
    it("should parse hwb with rad unit", () => {
      const result = parseHwb("hwb(2.09rad 20% 30%)");
      expect(result.ok).toBe(true);
      expect(result.value?.h).toEqual({ kind: "literal", value: 2.09, unit: "rad" });
    });

    it("should parse hwb with turn unit", () => {
      const result = parseHwb("hwb(0.33turn 20% 30%)");
      expect(result.ok).toBe(true);
      expect(result.value?.h).toEqual({ kind: "literal", value: 0.33, unit: "turn" });
    });

    it("should parse hwb with grad unit", () => {
      const result = parseHwb("hwb(133grad 20% 30%)");
      expect(result.ok).toBe(true);
      expect(result.value?.h).toEqual({ kind: "literal", value: 133, unit: "grad" });
    });
  });

  describe("Keywords", () => {
    it("should parse hwb(none none none)", () => {
      const result = parseHwb("hwb(none none none)");
      expect(result.ok).toBe(true);
      expect(result.value?.h).toEqual({ kind: "keyword", value: "none" });
      expect(result.value?.w).toEqual({ kind: "keyword", value: "none" });
      expect(result.value?.b).toEqual({ kind: "keyword", value: "none" });
    });

    it("should parse mixed values and keywords", () => {
      const result = parseHwb("hwb(120 none 30%)");
      expect(result.ok).toBe(true);
      expect(result.value?.h).toEqual({ kind: "literal", value: 120 });
      expect(result.value?.w).toEqual({ kind: "keyword", value: "none" });
      expect(result.value?.b).toEqual({ kind: "literal", value: 30, unit: "%" });
    });
  });

  describe("Edge cases", () => {
    it("should parse hwb with percentage alpha", () => {
      const result = parseHwb("hwb(120 20% 30% / 75%)");
      expect(result.ok).toBe(true);
      expect(result.value?.alpha).toEqual({ kind: "literal", value: 75, unit: "%" });
    });

    it("should parse hwb with zero alpha", () => {
      const result = parseHwb("hwb(120 20% 30% / 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.alpha).toEqual({ kind: "literal", value: 0 });
    });
  });

  describe("Error cases", () => {
    it("should return error for wrong function name", () => {
      const func = extractFunctionFromValue("rgb(0 0 0)");
      const result = parseHwbFunction(func);
      expect(result.ok).toBe(false);
      expect(result.error).toContain("Expected hwb()");
    });

    it("should return error for too few values", () => {
      const func = extractFunctionFromValue("hwb(120 20%)");
      const result = parseHwbFunction(func);
      expect(result.ok).toBe(false);
      expect(result.error).toContain("must have 3 or 4 values");
    });
  });
});
