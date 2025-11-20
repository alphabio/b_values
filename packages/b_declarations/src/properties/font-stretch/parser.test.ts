// b_path:: packages/b_declarations/src/properties/font-stretch/parser.test.ts

import { describe, expect, it } from "vitest";
import * as csstree from "@eslint/css-tree";
import { parseFontStretch } from "./parser";

function parseCSSValue(css: string): csstree.Value {
  const ast = csstree.parse(css, { context: "value" });
  if (ast.type !== "Value") throw new Error("Expected Value node");
  return ast;
}

describe("parseFontStretch", () => {
  it("parses normal", () => {
    const ast = parseCSSValue("normal");
    const result = parseFontStretch(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ kind: "keyword", value: "normal" });
    }
  });

  it("parses ultra-condensed", () => {
    const ast = parseCSSValue("ultra-condensed");
    const result = parseFontStretch(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("ultra-condensed");
    }
  });

  it("parses condensed", () => {
    const ast = parseCSSValue("condensed");
    const result = parseFontStretch(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("condensed");
    }
  });

  it("parses expanded", () => {
    const ast = parseCSSValue("expanded");
    const result = parseFontStretch(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("expanded");
    }
  });

  it("parses ultra-expanded", () => {
    const ast = parseCSSValue("ultra-expanded");
    const result = parseFontStretch(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("ultra-expanded");
    }
  });

  it("parses semi-condensed", () => {
    const ast = parseCSSValue("semi-condensed");
    const result = parseFontStretch(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("semi-condensed");
    }
  });

  it("parses semi-expanded", () => {
    const ast = parseCSSValue("semi-expanded");
    const result = parseFontStretch(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("semi-expanded");
    }
  });

  it("parses CSS-wide keywords", () => {
    const keywords = ["inherit", "initial", "unset", "revert", "revert-layer"];
    for (const kw of keywords) {
      const ast = parseCSSValue(kw);
      const result = parseFontStretch(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("keyword");
      }
    }
  });

  it("rejects empty value", () => {
    const ast = parseCSSValue("");
    const result = parseFontStretch(ast);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.code).toBe("missing-value");
    }
  });

  it("rejects invalid keyword", () => {
    const ast = parseCSSValue("wide");
    const result = parseFontStretch(ast);
    expect(result.ok).toBe(false);
  });

  it("handles case insensitivity", () => {
    const ast = parseCSSValue("CONDENSED");
    const result = parseFontStretch(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("condensed");
    }
  });
});
