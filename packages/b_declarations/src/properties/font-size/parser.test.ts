// b_path:: packages/b_declarations/src/properties/font-size/parser.test.ts

import { describe, expect, it } from "vitest";
import * as csstree from "@eslint/css-tree";
import { parseFontSize } from "./parser";

function parseCSSValue(css: string): csstree.Value {
  const ast = csstree.parse(css, { context: "value" });
  if (ast.type !== "Value") throw new Error("Expected Value node");
  return ast;
}

describe("parseFontSize", () => {
  describe("absolute size keywords", () => {
    it("parses xx-small", () => {
      const ast = parseCSSValue("xx-small");
      const result = parseFontSize(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({ kind: "keyword", value: "xx-small" });
      }
    });

    it("parses small", () => {
      const ast = parseCSSValue("small");
      const result = parseFontSize(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe("small");
      }
    });

    it("parses medium", () => {
      const ast = parseCSSValue("medium");
      const result = parseFontSize(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe("medium");
      }
    });

    it("parses large", () => {
      const ast = parseCSSValue("large");
      const result = parseFontSize(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe("large");
      }
    });

    it("parses xxx-large", () => {
      const ast = parseCSSValue("xxx-large");
      const result = parseFontSize(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe("xxx-large");
      }
    });

    it("handles case insensitivity", () => {
      const ast = parseCSSValue("LARGE");
      const result = parseFontSize(ast);
      expect(result.ok).toBe(true);
      if (result.ok && result.value.kind === "keyword") {
        expect(result.value.value).toBe("large");
      }
    });
  });

  describe("relative size keywords", () => {
    it("parses smaller", () => {
      const ast = parseCSSValue("smaller");
      const result = parseFontSize(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({ kind: "keyword", value: "smaller" });
      }
    });

    it("parses larger", () => {
      const ast = parseCSSValue("larger");
      const result = parseFontSize(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe("larger");
      }
    });
  });

  describe("length values", () => {
    it("parses px", () => {
      const ast = parseCSSValue("16px");
      const result = parseFontSize(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("value");
      }
    });

    it("parses em", () => {
      const ast = parseCSSValue("1.5em");
      const result = parseFontSize(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("value");
      }
    });

    it("parses rem", () => {
      const ast = parseCSSValue("2rem");
      const result = parseFontSize(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("value");
      }
    });

    it("parses zero without unit", () => {
      const ast = parseCSSValue("0");
      const result = parseFontSize(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("value");
      }
    });
  });

  describe("percentage values", () => {
    it("parses percentage", () => {
      const ast = parseCSSValue("120%");
      const result = parseFontSize(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("value");
      }
    });

    it("parses small percentage", () => {
      const ast = parseCSSValue("50%");
      const result = parseFontSize(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("value");
      }
    });
  });

  describe("math functions", () => {
    it("parses calc()", () => {
      const ast = parseCSSValue("calc(16px + 2em)");
      const result = parseFontSize(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("value");
      }
    });

    it("parses clamp()", () => {
      const ast = parseCSSValue("clamp(1rem, 2vw, 2rem)");
      const result = parseFontSize(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("value");
      }
    });

    it("parses min()", () => {
      const ast = parseCSSValue("min(2rem, 5vw)");
      const result = parseFontSize(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("value");
      }
    });

    it("parses max()", () => {
      const ast = parseCSSValue("max(1rem, 2vw)");
      const result = parseFontSize(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("value");
      }
    });
  });

  describe("CSS-wide keywords", () => {
    it("parses CSS-wide keywords", () => {
      const keywords = ["inherit", "initial", "unset", "revert", "revert-layer"];
      for (const kw of keywords) {
        const ast = parseCSSValue(kw);
        const result = parseFontSize(ast);
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
      const result = parseFontSize(ast);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues[0]?.code).toBe("missing-value");
      }
    });
  });
});
