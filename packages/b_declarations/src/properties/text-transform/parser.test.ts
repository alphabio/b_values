// b_path:: packages/b_declarations/src/properties/text-transform/parser.test.ts

import { describe, expect, it } from "vitest";
import * as csstree from "@eslint/css-tree";
import { parseTextTransform } from "./parser";

function parseCSSValue(css: string): csstree.Value {
  const ast = csstree.parse(css, { context: "value" });
  if (ast.type !== "Value") throw new Error("Expected Value node");
  return ast;
}

describe("parseTextTransform", () => {
  it("parses none", () => {
    const ast = parseCSSValue("none");
    const result = parseTextTransform(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ kind: "keyword", value: "none" });
    }
  });

  it("parses capitalize", () => {
    const ast = parseCSSValue("capitalize");
    const result = parseTextTransform(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("capitalize");
    }
  });

  it("parses uppercase", () => {
    const ast = parseCSSValue("uppercase");
    const result = parseTextTransform(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("uppercase");
    }
  });

  it("parses lowercase", () => {
    const ast = parseCSSValue("lowercase");
    const result = parseTextTransform(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("lowercase");
    }
  });

  it("parses full-width", () => {
    const ast = parseCSSValue("full-width");
    const result = parseTextTransform(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("full-width");
    }
  });

  it("parses full-size-kana", () => {
    const ast = parseCSSValue("full-size-kana");
    const result = parseTextTransform(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("full-size-kana");
    }
  });

  it("parses CSS-wide keywords", () => {
    const keywords = ["inherit", "initial", "unset", "revert", "revert-layer"];
    for (const kw of keywords) {
      const ast = parseCSSValue(kw);
      const result = parseTextTransform(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("keyword");
      }
    }
  });

  it("rejects empty value", () => {
    const ast = parseCSSValue("");
    const result = parseTextTransform(ast);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.code).toBe("missing-value");
    }
  });

  it("rejects invalid keyword", () => {
    const ast = parseCSSValue("invalid");
    const result = parseTextTransform(ast);
    expect(result.ok).toBe(false);
  });

  it("handles case insensitivity", () => {
    const ast = parseCSSValue("UPPERCASE");
    const result = parseTextTransform(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("uppercase");
    }
  });
});
