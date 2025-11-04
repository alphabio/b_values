// b_path:: packages/b_utils/src/parse/color/oklab.test.ts
import { describe, expect, it } from "vitest";
import { parseOklabFunction } from "./oklab";
import { extractFunctionFromValue } from "../../../b_utils/src/parse/test-helpers";

function parseOklab(input: string) {
  const func = extractFunctionFromValue(input);
  return parseOklabFunction(func);
}

describe("parseOklabFunction", () => {
  describe("Basic syntax", () => {
    it("should parse oklab(0.5 0.1 -0.1)", () => {
      const result = parseOklab("oklab(0.5 0.1 -0.1)");
      expect(result.ok).toBe(true);
      expect(result.value?.kind).toBe("oklab");
      expect(result.value?.l).toEqual({ kind: "literal", value: 0.5 });
      expect(result.value?.a).toEqual({ kind: "literal", value: 0.1 });
      expect(result.value?.b).toEqual({ kind: "literal", value: -0.1 });
      expect(result.value?.alpha).toBeUndefined();
    });

    it("should parse oklab with alpha", () => {
      const result = parseOklab("oklab(0.5 0.1 -0.1 / 0.5)");
      expect(result.ok).toBe(true);
      expect(result.value?.alpha).toEqual({ kind: "literal", value: 0.5 });
    });

    it("should parse oklab with percentage lightness", () => {
      const result = parseOklab("oklab(50% 0.1 -0.1)");
      expect(result.ok).toBe(true);
      expect(result.value?.l).toEqual({ kind: "literal", value: 50, unit: "%" });
    });

    it("should parse oklab(0 0 0) - black", () => {
      const result = parseOklab("oklab(0 0 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.l).toEqual({ kind: "literal", value: 0 });
      expect(result.value?.a).toEqual({ kind: "literal", value: 0 });
      expect(result.value?.b).toEqual({ kind: "literal", value: 0 });
    });

    it("should parse oklab(1 0 0) - white", () => {
      const result = parseOklab("oklab(1 0 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.l).toEqual({ kind: "literal", value: 1 });
    });
  });

  describe("Keywords", () => {
    it("should parse oklab(none none none)", () => {
      const result = parseOklab("oklab(none none none)");
      expect(result.ok).toBe(true);
      expect(result.value?.l).toEqual({ kind: "keyword", value: "none" });
      expect(result.value?.a).toEqual({ kind: "keyword", value: "none" });
      expect(result.value?.b).toEqual({ kind: "keyword", value: "none" });
    });

    it("should parse mixed values and keywords", () => {
      const result = parseOklab("oklab(0.5 none -0.1)");
      expect(result.ok).toBe(true);
      expect(result.value?.l).toEqual({ kind: "literal", value: 0.5 });
      expect(result.value?.a).toEqual({ kind: "keyword", value: "none" });
      expect(result.value?.b).toEqual({ kind: "literal", value: -0.1 });
    });
  });

  describe("Edge cases", () => {
    it("should parse oklab with percentage alpha", () => {
      const result = parseOklab("oklab(0.5 0.1 -0.1 / 75%)");
      expect(result.ok).toBe(true);
      expect(result.value?.alpha).toEqual({ kind: "literal", value: 75, unit: "%" });
    });

    it("should parse oklab with zero alpha", () => {
      const result = parseOklab("oklab(0.5 0.1 -0.1 / 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.alpha).toEqual({ kind: "literal", value: 0 });
    });

    it("should parse oklab with precise decimal values", () => {
      const result = parseOklab("oklab(0.54321 0.12345 -0.09876)");
      expect(result.ok).toBe(true);
      expect(result.value?.l).toEqual({ kind: "literal", value: 0.54321 });
      expect(result.value?.a).toEqual({ kind: "literal", value: 0.12345 });
      expect(result.value?.b).toEqual({ kind: "literal", value: -0.09876 });
    });
  });
});
