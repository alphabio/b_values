// b_path:: packages/b_declarations/src/properties/font-weight/parser.test.ts

import { describe, expect, it } from "vitest";
import * as csstree from "@eslint/css-tree";
import { parseFontWeight } from "./parser";

function parseCSSValue(css: string): csstree.Value {
  const ast = csstree.parse(css, { context: "value" });
  if (ast.type !== "Value") throw new Error("Expected Value node");
  return ast;
}

describe("parseFontWeight", () => {
  describe("keywords", () => {
    it("parses normal", () => {
      const ast = parseCSSValue("normal");
      const result = parseFontWeight(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({ kind: "keyword", value: "normal" });
      }
    });

    it("parses bold", () => {
      const ast = parseCSSValue("bold");
      const result = parseFontWeight(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe("bold");
      }
    });

    it("parses bolder", () => {
      const ast = parseCSSValue("bolder");
      const result = parseFontWeight(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe("bolder");
      }
    });

    it("parses lighter", () => {
      const ast = parseCSSValue("lighter");
      const result = parseFontWeight(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe("lighter");
      }
    });

    it("handles case insensitivity", () => {
      const ast = parseCSSValue("BOLD");
      const result = parseFontWeight(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe("bold");
      }
    });
  });

  describe("numeric values", () => {
    it("parses valid weight 400", () => {
      const ast = parseCSSValue("400");
      const result = parseFontWeight(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("value");
        expect(result.value.value).toEqual({ kind: "literal", value: 400 });
      }
    });

    it("parses valid weight 700", () => {
      const ast = parseCSSValue("700");
      const result = parseFontWeight(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("value");
        expect(result.value.value).toEqual({ kind: "literal", value: 700 });
      }
    });

    it("parses minimum weight 1", () => {
      const ast = parseCSSValue("1");
      const result = parseFontWeight(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("value");
        expect(result.value.value).toEqual({ kind: "literal", value: 1 });
      }
    });

    it("parses maximum weight 1000", () => {
      const ast = parseCSSValue("1000");
      const result = parseFontWeight(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("value");
        expect(result.value.value).toEqual({ kind: "literal", value: 1000 });
      }
    });

    it("parses decimal weight 350.5", () => {
      const ast = parseCSSValue("350.5");
      const result = parseFontWeight(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("value");
        expect(result.value.value).toEqual({ kind: "literal", value: 350.5 });
      }
    });

    it("parses weight below 1", () => {
      const ast = parseCSSValue("0");
      const result = parseFontWeight(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("value");
        expect(result.value.value).toEqual({ kind: "literal", value: 0 });
      }
    });

    it("parses weight above 1000", () => {
      const ast = parseCSSValue("1001");
      const result = parseFontWeight(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("value");
        expect(result.value.value).toEqual({ kind: "literal", value: 1001 });
      }
    });

    it("parses negative weight", () => {
      const ast = parseCSSValue("-100");
      const result = parseFontWeight(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("value");
        expect(result.value.value).toEqual({ kind: "literal", value: -100 });
      }
    });
  });

  describe("CSS-wide keywords", () => {
    it("parses CSS-wide keywords", () => {
      const keywords = ["inherit", "initial", "unset", "revert", "revert-layer"];
      for (const kw of keywords) {
        const ast = parseCSSValue(kw);
        const result = parseFontWeight(ast);
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.kind).toBe("keyword");
        }
      }
    });
  });

  describe("error cases", () => {
    it("rejects empty value", () => {
      const ast = parseCSSValue("");
      const result = parseFontWeight(ast);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues[0]?.code).toBe("missing-value");
      }
    });

    it("parses unrecognized keyword as CssValue", () => {
      const ast = parseCSSValue("thick");
      const result = parseFontWeight(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("value");
        expect(result.value.value).toEqual({ kind: "keyword", value: "thick" });
      }
    });
  });
});
