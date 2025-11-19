// b_path:: packages/b_declarations/src/properties/text-indent/parser.test.ts

import { describe, it, expect } from "vitest";
import * as csstree from "@eslint/css-tree";
import { parseTextIndent } from "./parser";

function parseCSSValue(css: string): csstree.Value {
  const ast = csstree.parse(css, { context: "value" });
  if (ast.type !== "Value") throw new Error("Expected Value node");
  return ast;
}

describe("parseTextIndent", () => {
  it("parses CSS-wide keywords", () => {
    const keywords = ["inherit", "initial", "revert", "revert-layer", "unset"];
    for (const keyword of keywords) {
      const ast = parseCSSValue(keyword);
      const result = parseTextIndent(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("value");
        if (result.value.kind === "value") {
          expect(result.value.value.kind).toBe("keyword");
        }
      }
    }
  });

  it("parses zero", () => {
    const ast = parseCSSValue("0");
    const result = parseTextIndent(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("value");
    }
  });

  it("parses length values", () => {
    const values = ["20px", "1.5em", "2rem", "10ch"];
    for (const value of values) {
      const ast = parseCSSValue(value);
      const result = parseTextIndent(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("value");
      }
    }
  });

  it("parses percentage values", () => {
    const values = ["10%", "50%", "100%"];
    for (const value of values) {
      const ast = parseCSSValue(value);
      const result = parseTextIndent(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("value");
      }
    }
  });

  it("parses negative values", () => {
    const values = ["-20px", "-1.5em", "-10%"];
    for (const value of values) {
      const ast = parseCSSValue(value);
      const result = parseTextIndent(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("value");
      }
    }
  });

  it("parses calc expressions", () => {
    const ast = parseCSSValue("calc(50% - 10px)");
    const result = parseTextIndent(ast);
    expect(result.ok).toBe(true);
    if (result.ok && result.value.kind === "value") {
      expect(result.value.value.kind).toBe("calc");
    }
  });

  it("rejects empty value", () => {
    const ast = parseCSSValue("");
    const result = parseTextIndent(ast);
    expect(result.ok).toBe(false);
  });
});
