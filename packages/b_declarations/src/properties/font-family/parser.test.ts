// b_path:: packages/b_declarations/src/properties/font-family/parser.test.ts

import { describe, expect, it } from "vitest";
import * as csstree from "@eslint/css-tree";
import { parseFontFamily } from "./parser";

function parseCSSValue(css: string): csstree.Value {
  const ast = csstree.parse(css, { context: "value" });
  if (ast.type !== "Value") throw new Error("Expected Value node");
  return ast;
}

describe("parseFontFamily", () => {
  describe("generic families", () => {
    it("parses serif", () => {
      const ast = parseCSSValue("serif");
      const result = parseFontFamily(ast);
      expect(result.ok).toBe(true);
      if (result.ok && result.value.kind === "list") {
        expect(result.value.families).toEqual(["serif"]);
      }
    });

    it("parses sans-serif", () => {
      const ast = parseCSSValue("sans-serif");
      const result = parseFontFamily(ast);
      expect(result.ok).toBe(true);
      if (result.ok && result.value.kind === "list") {
        expect(result.value.families).toEqual(["sans-serif"]);
      }
    });

    it("parses monospace", () => {
      const ast = parseCSSValue("monospace");
      const result = parseFontFamily(ast);
      expect(result.ok).toBe(true);
      if (result.ok && result.value.kind === "list") {
        expect(result.value.families).toEqual(["monospace"]);
      }
    });

    it("parses system-ui", () => {
      const ast = parseCSSValue("system-ui");
      const result = parseFontFamily(ast);
      expect(result.ok).toBe(true);
      if (result.ok && result.value.kind === "list") {
        expect(result.value.families).toEqual(["system-ui"]);
      }
    });
  });

  describe("quoted family names", () => {
    it("parses simple quoted name", () => {
      const ast = parseCSSValue('"Arial"');
      const result = parseFontFamily(ast);
      expect(result.ok).toBe(true);
      if (result.ok && result.value.kind === "list") {
        expect(result.value.families).toEqual(["Arial"]);
      }
    });

    it("parses quoted name with spaces", () => {
      const ast = parseCSSValue('"Times New Roman"');
      const result = parseFontFamily(ast);
      expect(result.ok).toBe(true);
      if (result.ok && result.value.kind === "list") {
        expect(result.value.families).toEqual(["Times New Roman"]);
      }
    });

    it("parses quoted name with special characters", () => {
      const ast = parseCSSValue('"MyFont-Bold!"');
      const result = parseFontFamily(ast);
      expect(result.ok).toBe(true);
      if (result.ok && result.value.kind === "list") {
        expect(result.value.families).toEqual(["MyFont-Bold!"]);
      }
    });
  });

  describe("unquoted family names", () => {
    it("parses single unquoted name", () => {
      const ast = parseCSSValue("Arial");
      const result = parseFontFamily(ast);
      expect(result.ok).toBe(true);
      if (result.ok && result.value.kind === "list") {
        expect(result.value.families).toEqual(["Arial"]);
      }
    });

    it("parses multi-word unquoted name", () => {
      const ast = parseCSSValue("Times New Roman");
      const result = parseFontFamily(ast);
      expect(result.ok).toBe(true);
      if (result.ok && result.value.kind === "list") {
        expect(result.value.families).toEqual(["Times New Roman"]);
      }
    });
  });

  describe("comma-separated lists", () => {
    it("parses two families", () => {
      const ast = parseCSSValue("Arial, serif");
      const result = parseFontFamily(ast);
      expect(result.ok).toBe(true);
      if (result.ok && result.value.kind === "list") {
        expect(result.value.families).toEqual(["Arial", "serif"]);
      }
    });

    it("parses three families", () => {
      const ast = parseCSSValue("Arial, Helvetica, sans-serif");
      const result = parseFontFamily(ast);
      expect(result.ok).toBe(true);
      if (result.ok && result.value.kind === "list") {
        expect(result.value.families).toEqual(["Arial", "Helvetica", "sans-serif"]);
      }
    });

    it("parses quoted and unquoted mixed", () => {
      const ast = parseCSSValue('"Times New Roman", Times, serif');
      const result = parseFontFamily(ast);
      expect(result.ok).toBe(true);
      if (result.ok && result.value.kind === "list") {
        expect(result.value.families).toEqual(["Times New Roman", "Times", "serif"]);
      }
    });

    it("parses multi-word unquoted with fallback", () => {
      const ast = parseCSSValue("Times New Roman, serif");
      const result = parseFontFamily(ast);
      expect(result.ok).toBe(true);
      if (result.ok && result.value.kind === "list") {
        expect(result.value.families).toEqual(["Times New Roman", "serif"]);
      }
    });
  });

  describe("CSS-wide keywords", () => {
    it("parses inherit", () => {
      const ast = parseCSSValue("inherit");
      const result = parseFontFamily(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({ kind: "keyword", value: "inherit" });
      }
    });

    it("parses initial", () => {
      const ast = parseCSSValue("initial");
      const result = parseFontFamily(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({ kind: "keyword", value: "initial" });
      }
    });
  });

  describe("error cases", () => {
    it("rejects empty value", () => {
      const ast = parseCSSValue("");
      const result = parseFontFamily(ast);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues[0]?.code).toBe("missing-value");
      }
    });
  });
});
