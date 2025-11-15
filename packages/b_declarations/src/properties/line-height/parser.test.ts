// b_path:: packages/b_declarations/src/properties/line-height/parser.test.ts

import { describe, it, expect } from "vitest";
import * as csstree from "@eslint/css-tree";
import { parseLineHeight } from "./parser";

function parseCSSValue(css: string): csstree.Value {
  const ast = csstree.parse(css, { context: "value" });
  if (ast.type !== "Value") throw new Error("Expected Value node");
  return ast;
}

describe("parseLineHeight", () => {
  it("parses normal keyword", () => {
    const ast = parseCSSValue("normal");
    const result = parseLineHeight(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ kind: "keyword", value: "normal" });
    }
  });

  it("parses CSS-wide keywords", () => {
    const keywords = ["inherit", "initial", "revert", "revert-layer", "unset"];
    for (const keyword of keywords) {
      const ast = parseCSSValue(keyword);
      const result = parseLineHeight(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({ kind: "keyword", value: keyword });
      }
    }
  });

  it("parses unitless number", () => {
    const ast = parseCSSValue("1.5");
    const result = parseLineHeight(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("value");
      expect(result.value.value).toEqual({ kind: "literal", value: 1.5 });
    }
  });

  it("parses length values", () => {
    const values = ["20px", "1.5em", "2rem", "150%"];
    for (const value of values) {
      const ast = parseCSSValue(value);
      const result = parseLineHeight(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("value");
      }
    }
  });

  it("parses calc expressions", () => {
    const ast = parseCSSValue("calc(1em + 2px)");
    const result = parseLineHeight(ast);
    expect(result.ok).toBe(true);
    if (result.ok && result.value.kind === "value") {
      expect(result.value.value.kind).toBe("calc");
    }
  });

  it("rejects empty value", () => {
    const ast = parseCSSValue("");
    const result = parseLineHeight(ast);
    expect(result.ok).toBe(false);
  });
});
