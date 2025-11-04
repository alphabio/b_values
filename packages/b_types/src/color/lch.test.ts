// b_path:: packages/b_types/src/color/lch.test.ts
import { describe, expect, it } from "vitest";
import { lchColorSchema, type LCHColor } from "./lch";

describe("lchColorSchema", () => {
  describe("literal values", () => {
    it("validates opaque LCH colors with literal numbers", () => {
      const color: LCHColor = {
        kind: "lch",
        l: { kind: "literal", value: 50 },
        c: { kind: "literal", value: 50 },
        h: { kind: "literal", value: 180 },
      };
      const result = lchColorSchema.safeParse(color);
      expect(result.success).toBe(true);
    });

    it("validates LCH colors with alpha", () => {
      const color: LCHColor = {
        kind: "lch",
        l: { kind: "literal", value: 50 },
        c: { kind: "literal", value: 50 },
        h: { kind: "literal", value: 180 },
        alpha: { kind: "literal", value: 0.5 },
      };
      const result = lchColorSchema.safeParse(color);
      expect(result.success).toBe(true);
    });

    it("validates literal with percentage unit", () => {
      const color: LCHColor = {
        kind: "lch",
        l: { kind: "literal", value: 50, unit: "%" },
        c: { kind: "literal", value: 50, unit: "%" },
        h: { kind: "literal", value: 180 },
      };
      const result = lchColorSchema.safeParse(color);
      expect(result.success).toBe(true);
    });

    it("validates hue with angle unit", () => {
      const color: LCHColor = {
        kind: "lch",
        l: { kind: "literal", value: 50 },
        c: { kind: "literal", value: 50 },
        h: { kind: "literal", value: 90, unit: "deg" },
      };
      const result = lchColorSchema.safeParse(color);
      expect(result.success).toBe(true);
    });

    it("accepts any numeric value (no range validation)", () => {
      const color: LCHColor = {
        kind: "lch",
        l: { kind: "literal", value: -100 },
        c: { kind: "literal", value: 999 },
        h: { kind: "literal", value: 420 },
        alpha: { kind: "literal", value: 2 },
      };
      const result = lchColorSchema.safeParse(color);
      expect(result.success).toBe(true);
    });
  });

  describe("variable references", () => {
    it("validates color with var() in lightness", () => {
      const color: LCHColor = {
        kind: "lch",
        l: { kind: "variable", name: "--my-lightness" },
        c: { kind: "literal", value: 50 },
        h: { kind: "literal", value: 180 },
      };
      const result = lchColorSchema.safeParse(color);
      expect(result.success).toBe(true);
    });

    it("validates color with var() in all channels", () => {
      const color: LCHColor = {
        kind: "lch",
        l: { kind: "variable", name: "--l" },
        c: { kind: "variable", name: "--c" },
        h: { kind: "variable", name: "--h" },
        alpha: { kind: "variable", name: "--alpha" },
      };
      const result = lchColorSchema.safeParse(color);
      expect(result.success).toBe(true);
    });

    it("validates var() with fallback", () => {
      const color: LCHColor = {
        kind: "lch",
        l: { kind: "literal", value: 50 },
        c: { kind: "literal", value: 50 },
        h: {
          kind: "variable",
          name: "--my-hue",
          fallback: { kind: "literal", value: 270, unit: "deg" },
        },
      };
      const result = lchColorSchema.safeParse(color);
      expect(result.success).toBe(true);
    });
  });

  describe("keyword values", () => {
    it("validates 'none' keyword", () => {
      const color: LCHColor = {
        kind: "lch",
        l: { kind: "keyword", value: "none" },
        c: { kind: "literal", value: 50 },
        h: { kind: "literal", value: 180 },
      };
      const result = lchColorSchema.safeParse(color);
      expect(result.success).toBe(true);
    });

    it("validates relative color syntax keywords", () => {
      const color: LCHColor = {
        kind: "lch",
        l: { kind: "keyword", value: "l" },
        c: { kind: "keyword", value: "c" },
        h: { kind: "keyword", value: "h" },
      };
      const result = lchColorSchema.safeParse(color);
      expect(result.success).toBe(true);
    });
  });

  describe("mixed value types", () => {
    it("validates mix of literals, variables, and keywords", () => {
      const color: LCHColor = {
        kind: "lch",
        l: { kind: "literal", value: 50 },
        c: { kind: "variable", name: "--chroma" },
        h: { kind: "keyword", value: "none" },
        alpha: { kind: "literal", value: 0.8 },
      };
      const result = lchColorSchema.safeParse(color);
      expect(result.success).toBe(true);
    });
  });

  describe("validation errors", () => {
    it("rejects wrong kind", () => {
      const result = lchColorSchema.safeParse({
        kind: "lab",
        l: { kind: "literal", value: 50 },
        c: { kind: "literal", value: 50 },
        h: { kind: "literal", value: 180 },
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing required fields", () => {
      const result = lchColorSchema.safeParse({
        kind: "lch",
        l: { kind: "literal", value: 50 },
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid value structure", () => {
      const result = lchColorSchema.safeParse({
        kind: "lch",
        l: 50, // Should be CssValue object, not number
        c: { kind: "literal", value: 50 },
        h: { kind: "literal", value: 180 },
      });
      expect(result.success).toBe(false);
    });
  });
});
