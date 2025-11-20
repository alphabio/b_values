// b_path:: packages/b_declarations/src/properties/font-style/parser.test.ts

import { describe, expect, it } from "vitest";
import * as csstree from "@eslint/css-tree";
import { parseFontStyle } from "./parser";

function parseCSSValue(css: string): csstree.Value {
  const ast = csstree.parse(css, { context: "value" });
  if (ast.type !== "Value") throw new Error("Expected Value node");
  return ast;
}

describe("parseFontStyle", () => {
  describe("simple keywords", () => {
    it("parses normal", () => {
      const ast = parseCSSValue("normal");
      const result = parseFontStyle(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({ kind: "keyword", value: "normal" });
      }
    });

    it("parses italic", () => {
      const ast = parseCSSValue("italic");
      const result = parseFontStyle(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({ kind: "keyword", value: "italic" });
      }
    });

    it("handles case insensitivity", () => {
      const ast = parseCSSValue("ITALIC");
      const result = parseFontStyle(ast);
      expect(result.ok).toBe(true);
      if (result.ok && result.value.kind === "keyword") {
        expect(result.value.value).toBe("italic");
      }
    });
  });

  describe("oblique without angle", () => {
    it("parses plain oblique", () => {
      const ast = parseCSSValue("oblique");
      const result = parseFontStyle(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({ kind: "oblique" });
      }
    });
  });

  describe("oblique with angle", () => {
    it("parses oblique with deg", () => {
      const ast = parseCSSValue("oblique 14deg");
      const result = parseFontStyle(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("oblique");
        if (result.value.kind === "oblique") {
          expect(result.value.angle).toEqual({ value: 14, unit: "deg" });
        }
      }
    });

    it("parses oblique with negative angle", () => {
      const ast = parseCSSValue("oblique -14deg");
      const result = parseFontStyle(ast);
      expect(result.ok).toBe(true);
      if (result.ok && result.value.kind === "oblique") {
        expect(result.value.angle?.value).toBe(-14);
      }
    });

    it("parses oblique with rad", () => {
      const ast = parseCSSValue("oblique 0.25rad");
      const result = parseFontStyle(ast);
      expect(result.ok).toBe(true);
      if (result.ok && result.value.kind === "oblique") {
        expect(result.value.angle).toEqual({ value: 0.25, unit: "rad" });
      }
    });

    it("parses oblique with grad", () => {
      const ast = parseCSSValue("oblique 15grad");
      const result = parseFontStyle(ast);
      expect(result.ok).toBe(true);
      if (result.ok && result.value.kind === "oblique") {
        expect(result.value.angle).toEqual({ value: 15, unit: "grad" });
      }
    });

    it("parses oblique with turn", () => {
      const ast = parseCSSValue("oblique 0.04turn");
      const result = parseFontStyle(ast);
      expect(result.ok).toBe(true);
      if (result.ok && result.value.kind === "oblique") {
        expect(result.value.angle).toEqual({ value: 0.04, unit: "turn" });
      }
    });

    it("parses oblique with zero angle", () => {
      const ast = parseCSSValue("oblique 0deg");
      const result = parseFontStyle(ast);
      expect(result.ok).toBe(true);
      if (result.ok && result.value.kind === "oblique") {
        expect(result.value.angle?.value).toBe(0);
      }
    });
  });

  describe("CSS-wide keywords", () => {
    it("parses CSS-wide keywords", () => {
      const keywords = ["inherit", "initial", "unset", "revert", "revert-layer"];
      for (const kw of keywords) {
        const ast = parseCSSValue(kw);
        const result = parseFontStyle(ast);
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
      const result = parseFontStyle(ast);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues[0]?.code).toBe("missing-value");
      }
    });

    it("rejects invalid keyword", () => {
      const ast = parseCSSValue("slanted");
      const result = parseFontStyle(ast);
      expect(result.ok).toBe(false);
    });
  });
});
