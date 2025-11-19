// b_path:: packages/b_declarations/src/properties/white-space/parser.test.ts

import { describe, expect, it } from "vitest";
import * as csstree from "@eslint/css-tree";
import { parseWhiteSpace } from "./parser";

function parseCSSValue(css: string): csstree.Value {
  const ast = csstree.parse(css, { context: "value" });
  if (ast.type !== "Value") throw new Error("Expected Value node");
  return ast;
}

describe("parseWhiteSpace", () => {
  it("parses normal", () => {
    const ast = parseCSSValue("normal");
    const result = parseWhiteSpace(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ kind: "keyword", value: "normal" });
    }
  });

  it("parses pre", () => {
    const ast = parseCSSValue("pre");
    const result = parseWhiteSpace(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("pre");
    }
  });

  it("parses nowrap", () => {
    const ast = parseCSSValue("nowrap");
    const result = parseWhiteSpace(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("nowrap");
    }
  });

  it("parses pre-wrap", () => {
    const ast = parseCSSValue("pre-wrap");
    const result = parseWhiteSpace(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("pre-wrap");
    }
  });

  it("parses pre-line", () => {
    const ast = parseCSSValue("pre-line");
    const result = parseWhiteSpace(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("pre-line");
    }
  });

  it("parses break-spaces", () => {
    const ast = parseCSSValue("break-spaces");
    const result = parseWhiteSpace(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("break-spaces");
    }
  });

  it("parses CSS-wide keywords", () => {
    const keywords = ["inherit", "initial", "unset", "revert", "revert-layer"];
    for (const kw of keywords) {
      const ast = parseCSSValue(kw);
      const result = parseWhiteSpace(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("keyword");
      }
    }
  });

  it("rejects empty value", () => {
    const ast = parseCSSValue("");
    const result = parseWhiteSpace(ast);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.code).toBe("missing-value");
    }
  });

  it("rejects invalid keyword", () => {
    const ast = parseCSSValue("invalid");
    const result = parseWhiteSpace(ast);
    expect(result.ok).toBe(false);
  });

  it("handles case insensitivity", () => {
    const ast = parseCSSValue("PRE-WRAP");
    const result = parseWhiteSpace(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("pre-wrap");
    }
  });
});
