// b_path:: packages/b_generators/src/color/lch.test.ts
import { describe, expect, it } from "vitest";
import type { LCHColor } from "@b/types";
import * as LCH from "./lch";

const lit = (value: number) => ({ kind: "literal" as const, value });

describe("lch generator", () => {
  describe("literal values", () => {
    it("should generate opaque LCH color", () => {
      const color: LCHColor = {
        kind: "lch",
        l: { kind: "literal", value: 55 },
        c: { kind: "literal", value: 100 },
        h: { kind: "literal", value: 90 },
      };
      const result = LCH.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("lch(55 100 90)");
      }
    });

    it("should generate LCH color with alpha", () => {
      const color: LCHColor = {
        kind: "lch",
        l: { kind: "literal", value: 55 },
        c: { kind: "literal", value: 100 },
        h: { kind: "literal", value: 90 },
        alpha: { kind: "literal", value: 0.5 },
      };
      const result = LCH.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("lch(55 100 90 / 0.5)");
      }
    });

    it("should include alpha when explicitly 0", () => {
      const color: LCHColor = {
        kind: "lch",
        l: { kind: "literal", value: 55 },
        c: { kind: "literal", value: 100 },
        h: { kind: "literal", value: 90 },
        alpha: { kind: "literal", value: 0 },
      };
      const result = LCH.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("lch(55 100 90 / 0)");
      }
    });

    it("should include alpha when explicitly 1", () => {
      const color: LCHColor = {
        kind: "lch",
        l: { kind: "literal", value: 55 },
        c: { kind: "literal", value: 100 },
        h: { kind: "literal", value: 90 },
        alpha: { kind: "literal", value: 1 },
      };
      const result = LCH.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("lch(55 100 90 / 1)");
      }
    });

    it("should generate with percentage units", () => {
      const color: LCHColor = {
        kind: "lch",
        l: { kind: "literal", value: 55, unit: "%" },
        c: { kind: "literal", value: 100, unit: "%" },
        h: { kind: "literal", value: 90 },
      };
      const result = LCH.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("lch(55% 100% 90)");
      }
    });

    it("should generate with angle unit for hue", () => {
      const color: LCHColor = {
        kind: "lch",
        l: { kind: "literal", value: 55 },
        c: { kind: "literal", value: 100 },
        h: { kind: "literal", value: 90, unit: "deg" },
      };
      const result = LCH.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("lch(55 100 90deg)");
      }
    });

    it("should pass through out-of-range values (no validation)", () => {
      const color: LCHColor = {
        kind: "lch",
        l: { kind: "literal", value: -50 },
        c: { kind: "literal", value: 999 },
        h: { kind: "literal", value: 420 },
        alpha: { kind: "literal", value: 2 },
      };
      const result = LCH.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("lch(-50 999 420 / 2)");
      }
    });
  });

  describe("variable references", () => {
    it("should generate with var() in lightness", () => {
      const color: LCHColor = {
        kind: "lch",
        l: { kind: "variable", name: "--my-lightness" },
        c: { kind: "literal", value: 100 },
        h: { kind: "literal", value: 90 },
      };
      const result = LCH.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("lch(var(--my-lightness) 100 90)");
      }
    });

    it("should generate with var() in all channels", () => {
      const color: LCHColor = {
        kind: "lch",
        l: { kind: "variable", name: "--l" },
        c: { kind: "variable", name: "--c" },
        h: { kind: "variable", name: "--h" },
      };
      const result = LCH.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("lch(var(--l) var(--c) var(--h))");
      }
    });

    it("should generate with var() and fallback", () => {
      const color: LCHColor = {
        kind: "lch",
        l: { kind: "literal", value: 55 },
        c: { kind: "literal", value: 100 },
        h: {
          kind: "variable",
          name: "--my-hue",
          fallback: { kind: "literal", value: 270, unit: "deg" },
        },
      };
      const result = LCH.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("lch(55 100 var(--my-hue, 270deg))");
      }
    });

    it("should generate with var() in alpha", () => {
      const color: LCHColor = {
        kind: "lch",
        l: { kind: "literal", value: 55 },
        c: { kind: "literal", value: 100 },
        h: { kind: "literal", value: 90 },
        alpha: { kind: "variable", name: "--opacity" },
      };
      const result = LCH.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("lch(55 100 90 / var(--opacity))");
      }
    });

    it("should generate with nested var() fallbacks", () => {
      const color: LCHColor = {
        kind: "lch",
        l: { kind: "literal", value: 55 },
        c: {
          kind: "variable",
          name: "--primary-chroma",
          fallback: {
            kind: "variable",
            name: "--secondary-chroma",
            fallback: { kind: "literal", value: 50 },
          },
        },
        h: { kind: "literal", value: 90 },
      };
      const result = LCH.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("lch(55 var(--primary-chroma, var(--secondary-chroma, 50)) 90)");
      }
    });
  });

  describe("keyword values", () => {
    it("should generate with 'none' keyword", () => {
      const color: LCHColor = {
        kind: "lch",
        l: { kind: "keyword", value: "none" },
        c: { kind: "literal", value: 100 },
        h: { kind: "literal", value: 90 },
      };
      const result = LCH.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("lch(none 100 90)");
      }
    });

    it("should generate with relative color syntax keywords", () => {
      const color: LCHColor = {
        kind: "lch",
        l: { kind: "keyword", value: "l" },
        c: { kind: "keyword", value: "c" },
        h: { kind: "keyword", value: "h" },
      };
      const result = LCH.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("lch(l c h)");
      }
    });
  });

  describe("mixed value types", () => {
    it("should generate with mix of literals, variables, and keywords", () => {
      const color: LCHColor = {
        kind: "lch",
        l: { kind: "literal", value: 55 },
        c: { kind: "variable", name: "--chroma" },
        h: { kind: "keyword", value: "none" },
        alpha: { kind: "literal", value: 0.8 },
      };
      const result = LCH.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("lch(55 var(--chroma) none / 0.8)");
      }
    });

    it("should generate with calc in hue", () => {
      const color: LCHColor = {
        kind: "lch",
        l: { kind: "literal", value: 55 },
        c: { kind: "variable", name: "--chroma" },
        h: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "+",
            left: { kind: "literal", value: 90, unit: "deg" },
            right: { kind: "literal", value: 10, unit: "deg" },
          },
        },
      };
      const result = LCH.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("lch(55 var(--chroma) calc(90deg + 10deg))");
      }
    });

    it("should generate with calc and variable", () => {
      const color: LCHColor = {
        kind: "lch",
        l: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "*",
            left: { kind: "variable", name: "--base-l" },
            right: { kind: "literal", value: 1.2 },
          },
        },
        c: { kind: "literal", value: 100 },
        h: { kind: "literal", value: 90 },
      };
      const result = LCH.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("lch(calc(var(--base-l) * 1.2) 100 90)");
      }
    });

    it("should generate with all CssValue types", () => {
      const color: LCHColor = {
        kind: "lch",
        l: { kind: "variable", name: "--l" },
        c: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "+",
            left: lit(50),
            right: lit(10),
          },
        },
        h: { kind: "keyword", value: "none" },
        alpha: { kind: "variable", name: "--opacity" },
      };
      const result = LCH.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("lch(var(--l) calc(50 + 10) none / var(--opacity))");
      }
    });
  });

  describe("error cases", () => {
    it("should return error for null color", () => {
      const result = LCH.generate(null as unknown as LCHColor);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues[0]?.code).toBe("invalid-ir");
      }
    });

    it("should return error for missing fields", () => {
      const color = { kind: "lch", l: { kind: "literal", value: 55 } } as LCHColor;
      const result = LCH.generate(color);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues[0]?.code).toBe("invalid-ir");
      }
    });
  });
});
