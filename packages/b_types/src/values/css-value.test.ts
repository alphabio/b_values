// b_path:: packages/b_types/src/values/css-value.test.ts
import { describe, expect, it } from "vitest";
import {
  cssValueSchema,
  type CssValue,
  type KeywordValue,
  type LiteralValue,
  type VariableReference,
} from "./css-value";

describe("CssValue schemas", () => {
  describe("LiteralValue", () => {
    it("should validate literal number without unit", () => {
      const value: CssValue = {
        kind: "literal",
        value: 42,
      };
      const result = cssValueSchema.safeParse(value);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.kind).toBe("literal");
        expect((result.data as LiteralValue).value).toBe(42);
      }
    });

    it("should validate literal with unit", () => {
      const value: CssValue = {
        kind: "literal",
        value: 90,
        unit: "deg",
      };
      const result = cssValueSchema.safeParse(value);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.kind).toBe("literal");
        expect((result.data as LiteralValue).value).toBe(90);
        expect((result.data as LiteralValue).unit).toBe("deg");
      }
    });

    it("should validate percentage", () => {
      const value: CssValue = {
        kind: "literal",
        value: 50,
        unit: "%",
      };
      const result = cssValueSchema.safeParse(value);
      expect(result.success).toBe(true);
      if (result.success) {
        expect((result.data as LiteralValue).unit).toBe("%");
      }
    });

    it("should accept any numeric value (no range validation)", () => {
      const value: CssValue = {
        kind: "literal",
        value: 999999,
      };
      const result = cssValueSchema.safeParse(value);
      expect(result.success).toBe(true);
    });

    it("should accept negative values", () => {
      const value: CssValue = {
        kind: "literal",
        value: -125,
      };
      const result = cssValueSchema.safeParse(value);
      expect(result.success).toBe(true);
    });

    it("should accept decimal values", () => {
      const value: CssValue = {
        kind: "literal",
        value: 0.5,
      };
      const result = cssValueSchema.safeParse(value);
      expect(result.success).toBe(true);
    });
  });

  describe("VariableReference", () => {
    it("should validate simple variable reference", () => {
      const value: CssValue = {
        kind: "variable",
        name: "--my-color",
      };
      const result = cssValueSchema.safeParse(value);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.kind).toBe("variable");
        expect((result.data as VariableReference).name).toBe("--my-color");
      }
    });

    it("should validate variable with literal fallback", () => {
      const value: CssValue = {
        kind: "variable",
        name: "--my-hue",
        fallback: {
          kind: "literal",
          value: 270,
          unit: "deg",
        },
      };
      const result = cssValueSchema.safeParse(value);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.kind).toBe("variable");
        const varRef = result.data as VariableReference;
        expect(varRef.name).toBe("--my-hue");
        expect(varRef.fallback).toBeDefined();
        expect(varRef.fallback?.kind).toBe("literal");
      }
    });

    it("should validate variable with nested variable fallback", () => {
      const value: CssValue = {
        kind: "variable",
        name: "--primary",
        fallback: {
          kind: "variable",
          name: "--secondary",
          fallback: {
            kind: "literal",
            value: 0,
          },
        },
      };
      const result = cssValueSchema.safeParse(value);
      expect(result.success).toBe(true);
    });

    it("should validate variable with keyword fallback", () => {
      const value: CssValue = {
        kind: "variable",
        name: "--lightness",
        fallback: {
          kind: "keyword",
          value: "none",
        },
      };
      const result = cssValueSchema.safeParse(value);
      expect(result.success).toBe(true);
    });
  });

  describe("KeywordValue", () => {
    it("should validate 'none' keyword", () => {
      const value: CssValue = {
        kind: "keyword",
        value: "none",
      };
      const result = cssValueSchema.safeParse(value);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.kind).toBe("keyword");
        expect((result.data as KeywordValue).value).toBe("none");
      }
    });

    it("should validate relative color syntax keywords", () => {
      const keywords = ["l", "c", "h", "r", "g", "b", "s", "alpha"];
      for (const kw of keywords) {
        const value: CssValue = {
          kind: "keyword",
          value: kw,
        };
        const result = cssValueSchema.safeParse(value);
        expect(result.success).toBe(true);
      }
    });

    it("should accept any string as keyword", () => {
      const value: CssValue = {
        kind: "keyword",
        value: "custom-keyword",
      };
      const result = cssValueSchema.safeParse(value);
      expect(result.success).toBe(true);
    });
  });

  describe("Union validation", () => {
    it("should reject invalid kind", () => {
      const value = {
        kind: "invalid",
        value: 42,
      };
      const result = cssValueSchema.safeParse(value);
      expect(result.success).toBe(false);
    });

    it("should reject missing required fields", () => {
      const value = {
        kind: "literal",
      };
      const result = cssValueSchema.safeParse(value);
      expect(result.success).toBe(false);
    });
  });
});
