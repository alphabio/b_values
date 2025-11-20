// b_path:: packages/b_declarations/src/properties/letter-spacing/parser.test.ts

import { describe, it, expect } from "vitest";
import * as csstree from "@eslint/css-tree";
import { parseLetterSpacing } from "./parser";

function parseCSSValue(css: string): csstree.Value {
  const ast = csstree.parse(css, { context: "value" });
  if (ast.type !== "Value") throw new Error("Expected Value node");
  return ast;
}

describe("parseLetterSpacing", () => {
  it("parses normal keyword", () => {
    const ast = parseCSSValue("normal");
    const result = parseLetterSpacing(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ kind: "keyword", value: "normal" });
    }
  });

  it("parses CSS-wide keywords", () => {
    const keywords = ["inherit", "initial", "revert", "revert-layer", "unset"];
    for (const keyword of keywords) {
      const ast = parseCSSValue(keyword);
      const result = parseLetterSpacing(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({ kind: "keyword", value: keyword });
      }
    }
  });

  it("parses length values", () => {
    const values = ["0", "1px", "0.5em", "2rem", "-1px"];
    for (const value of values) {
      const ast = parseCSSValue(value);
      const result = parseLetterSpacing(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("value");
      }
    }
  });

  it("parses calc expressions", () => {
    const ast = parseCSSValue("calc(1em + 2px)");
    const result = parseLetterSpacing(ast);
    expect(result.ok).toBe(true);
    if (result.ok && result.value.kind === "value") {
      expect(result.value.value.kind).toBe("calc");
    }
  });

  it("handles case insensitivity for normal", () => {
    const ast = parseCSSValue("NORMAL");
    const result = parseLetterSpacing(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("normal");
    }
  });

  it("rejects empty value", () => {
    const ast = parseCSSValue("");
    const result = parseLetterSpacing(ast);
    expect(result.ok).toBe(false);
  });
});
