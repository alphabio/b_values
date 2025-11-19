// b_path:: packages/b_declarations/src/properties/word-spacing/parser.test.ts

import { describe, it, expect } from "vitest";
import * as csstree from "@eslint/css-tree";
import { parseWordSpacing } from "./parser";

function parseCSSValue(css: string): csstree.Value {
  const ast = csstree.parse(css, { context: "value" });
  if (ast.type !== "Value") throw new Error("Expected Value node");
  return ast;
}

describe("parseWordSpacing", () => {
  it("parses normal keyword", () => {
    const ast = parseCSSValue("normal");
    const result = parseWordSpacing(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ kind: "keyword", value: "normal" });
    }
  });

  it("parses CSS-wide keywords", () => {
    const keywords = ["inherit", "initial", "revert", "revert-layer", "unset"];
    for (const keyword of keywords) {
      const ast = parseCSSValue(keyword);
      const result = parseWordSpacing(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({ kind: "keyword", value: keyword });
      }
    }
  });

  it("parses length and percentage values", () => {
    const values = ["0", "5px", "1.5em", "2rem", "10%", "-2px"];
    for (const value of values) {
      const ast = parseCSSValue(value);
      const result = parseWordSpacing(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("value");
      }
    }
  });

  it("parses calc expressions", () => {
    const ast = parseCSSValue("calc(1em + 2px)");
    const result = parseWordSpacing(ast);
    expect(result.ok).toBe(true);
    if (result.ok && result.value.kind === "value") {
      expect(result.value.value.kind).toBe("calc");
    }
  });

  it("handles case insensitivity for normal", () => {
    const ast = parseCSSValue("NORMAL");
    const result = parseWordSpacing(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("normal");
    }
  });

  it("rejects empty value", () => {
    const ast = parseCSSValue("");
    const result = parseWordSpacing(ast);
    expect(result.ok).toBe(false);
  });
});
