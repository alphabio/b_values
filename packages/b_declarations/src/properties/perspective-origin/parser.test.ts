// b_path:: packages/b_declarations/src/properties/perspective-origin/parser.test.ts

import { describe, expect, it } from "vitest";
import * as csstree from "@eslint/css-tree";
import { parsePerspectiveOrigin } from "./parser";

function parseCSSValue(css: string): csstree.Value {
  const ast = csstree.parse(css, { context: "value" });
  if (ast.type !== "Value") throw new Error("Expected Value node");
  return ast;
}

describe("parsePerspectiveOrigin", () => {
  it("parses single keyword - center", () => {
    const ast = parseCSSValue("center");
    const result = parsePerspectiveOrigin(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("position");
    }
  });

  it("parses single keyword - left", () => {
    const ast = parseCSSValue("left");
    const result = parsePerspectiveOrigin(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("position");
    }
  });

  it("parses single keyword - top", () => {
    const ast = parseCSSValue("top");
    const result = parsePerspectiveOrigin(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("position");
    }
  });

  it("parses two keywords", () => {
    const ast = parseCSSValue("left top");
    const result = parsePerspectiveOrigin(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("position");
    }
  });

  it("parses length values", () => {
    const ast = parseCSSValue("100px 200px");
    const result = parsePerspectiveOrigin(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("position");
    }
  });

  it("parses percentage values", () => {
    const ast = parseCSSValue("50% 50%");
    const result = parsePerspectiveOrigin(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("position");
    }
  });

  it("parses mixed length and percentage", () => {
    const ast = parseCSSValue("20px 30%");
    const result = parsePerspectiveOrigin(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("position");
    }
  });

  it("parses keyword with offset - 4-value syntax", () => {
    const ast = parseCSSValue("left 20px top 30px");
    const result = parsePerspectiveOrigin(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("position");
    }
  });

  it("parses 3-value syntax", () => {
    const ast = parseCSSValue("left 20px top");
    const result = parsePerspectiveOrigin(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("position");
    }
  });

  it("parses CSS-wide keywords", () => {
    const keywords = ["inherit", "initial", "unset", "revert", "revert-layer"];
    for (const kw of keywords) {
      const ast = parseCSSValue(kw);
      const result = parsePerspectiveOrigin(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("keyword");
      }
    }
  });

  it("rejects empty value", () => {
    const ast = parseCSSValue("");
    const result = parsePerspectiveOrigin(ast);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.code).toBe("missing-value");
    }
  });

  it("parses em units", () => {
    const ast = parseCSSValue("5em 10em");
    const result = parsePerspectiveOrigin(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("position");
    }
  });

  it("parses rem units", () => {
    const ast = parseCSSValue("2.5rem 3.5rem");
    const result = parsePerspectiveOrigin(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("position");
    }
  });

  it("parses viewport units", () => {
    const ast = parseCSSValue("50vw 50vh");
    const result = parsePerspectiveOrigin(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("position");
    }
  });
});
