// b_path:: packages/b_declarations/src/properties/text-align/parser.test.ts

import { describe, expect, it } from "vitest";
import * as csstree from "@eslint/css-tree";
import { parseTextAlign } from "./parser";

function parseCSSValue(css: string): csstree.Value {
  const ast = csstree.parse(css, { context: "value" });
  if (ast.type !== "Value") throw new Error("Expected Value node");
  return ast;
}

describe("parseTextAlign", () => {
  it("parses start", () => {
    const ast = parseCSSValue("start");
    const result = parseTextAlign(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ kind: "keyword", value: "start" });
    }
  });

  it("parses end", () => {
    const ast = parseCSSValue("end");
    const result = parseTextAlign(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("end");
    }
  });

  it("parses left", () => {
    const ast = parseCSSValue("left");
    const result = parseTextAlign(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("left");
    }
  });

  it("parses right", () => {
    const ast = parseCSSValue("right");
    const result = parseTextAlign(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("right");
    }
  });

  it("parses center", () => {
    const ast = parseCSSValue("center");
    const result = parseTextAlign(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("center");
    }
  });

  it("parses justify", () => {
    const ast = parseCSSValue("justify");
    const result = parseTextAlign(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("justify");
    }
  });

  it("parses match-parent", () => {
    const ast = parseCSSValue("match-parent");
    const result = parseTextAlign(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("match-parent");
    }
  });

  it("parses CSS-wide keywords", () => {
    const keywords = ["inherit", "initial", "unset", "revert", "revert-layer"];
    for (const kw of keywords) {
      const ast = parseCSSValue(kw);
      const result = parseTextAlign(ast);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("keyword");
      }
    }
  });

  it("rejects empty value", () => {
    const ast = parseCSSValue("");
    const result = parseTextAlign(ast);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.code).toBe("missing-value");
    }
  });

  it("rejects invalid keyword", () => {
    const ast = parseCSSValue("invalid");
    const result = parseTextAlign(ast);
    expect(result.ok).toBe(false);
  });

  it("handles case insensitivity", () => {
    const ast = parseCSSValue("CENTER");
    const result = parseTextAlign(ast);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe("center");
    }
  });
});
