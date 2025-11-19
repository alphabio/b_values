// b_path:: packages/b_declarations/src/properties/perspective/parser.test.ts

import { describe, expect, it } from "vitest";
import * as csstree from "@eslint/css-tree";
import { parsePerspective } from "./parser";

function parseCSSValue(css: string): csstree.Value {
  const ast = csstree.parse(css, { context: "value" });
  if (ast.type !== "Value") throw new Error("Expected Value node");
  return ast;
}

describe("parsePerspective", () => {
  it("parses none keyword", () => {
    const ast = parseCSSValue("none");
    const result = parsePerspective(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ kind: "keyword", value: "none" });
    }
  });

  it("parses pixel length", () => {
    const ast = parseCSSValue("500px");
    const result = parsePerspective(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("value");
      expect(result.value.value).toEqual({ kind: "literal", value: 500, unit: "px" });
    }
  });

  it("parses em length", () => {
    const ast = parseCSSValue("10em");
    const result = parsePerspective(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("value");
      expect(result.value.value).toEqual({ kind: "literal", value: 10, unit: "em" });
    }
  });

  it("parses rem length", () => {
    const ast = parseCSSValue("2.5rem");
    const result = parsePerspective(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("value");
      expect(result.value.value).toEqual({ kind: "literal", value: 2.5, unit: "rem" });
    }
  });

  it("parses viewport units", () => {
    const ast = parseCSSValue("50vh");
    const result = parsePerspective(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("value");
      expect(result.value.value).toEqual({ kind: "literal", value: 50, unit: "vh" });
    }
  });

  it("parses negative length", () => {
    const ast = parseCSSValue("-100px");
    const result = parsePerspective(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("value");
      expect(result.value.value).toEqual({ kind: "literal", value: -100, unit: "px" });
    }
  });

  it("parses CSS-wide keywords", () => {
    const keywords = ["inherit", "initial", "unset", "revert", "revert-layer"];
    for (const kw of keywords) {
      const ast = parseCSSValue(kw);
      const result = parsePerspective(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("keyword");
      }
    }
  });

  it("rejects empty value", () => {
    const ast = parseCSSValue("");
    const result = parsePerspective(ast);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.code).toBe("missing-value");
    }
  });

  it("parses keyword as CssValue", () => {
    const ast = parseCSSValue("auto");
    const result = parsePerspective(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("value");
      expect(result.value.value).toEqual({ kind: "keyword", value: "auto" });
    }
  });

  it("parses percentage as CssValue", () => {
    const ast = parseCSSValue("50%");
    const result = parsePerspective(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("value");
      expect(result.value.value).toEqual({ kind: "literal", value: 50, unit: "%" });
    }
  });

  it("parses unitless number as CssValue", () => {
    const ast = parseCSSValue("100");
    const result = parsePerspective(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("value");
      expect(result.value.value).toEqual({ kind: "literal", value: 100 });
    }
  });
});
