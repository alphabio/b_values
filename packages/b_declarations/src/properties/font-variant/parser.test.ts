// b_path:: packages/b_declarations/src/properties/font-variant/parser.test.ts

import { describe, expect, it } from "vitest";
import * as csstree from "@eslint/css-tree";
import { parseFontVariant } from "./parser";

function parseCSSValue(css: string): csstree.Value {
  const ast = csstree.parse(css, { context: "value" });
  if (ast.type !== "Value") throw new Error("Expected Value node");
  return ast;
}

describe("parseFontVariant", () => {
  it("parses normal", () => {
    const ast = parseCSSValue("normal");
    const result = parseFontVariant(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ kind: "keyword", value: "normal" });
    }
  });

  it("parses small-caps", () => {
    const ast = parseCSSValue("small-caps");
    const result = parseFontVariant(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("small-caps");
    }
  });

  it("parses CSS-wide keywords", () => {
    const keywords = ["inherit", "initial", "unset", "revert", "revert-layer"];
    for (const kw of keywords) {
      const ast = parseCSSValue(kw);
      const result = parseFontVariant(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("keyword");
      }
    }
  });

  it("rejects empty value", () => {
    const ast = parseCSSValue("");
    const result = parseFontVariant(ast);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.code).toBe("missing-value");
    }
  });

  it("rejects invalid keyword", () => {
    const ast = parseCSSValue("large-caps");
    const result = parseFontVariant(ast);
    expect(result.ok).toBe(false);
  });

  it("handles case insensitivity", () => {
    const ast = parseCSSValue("SMALL-CAPS");
    const result = parseFontVariant(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("small-caps");
    }
  });
});
