// b_path:: packages/b_parsers/src/css-value-parser.test.ts
import { describe, expect, it } from "vitest";
import { parseNodeToCssValue } from "./css-value-parser";
import { parse } from "@eslint/css-tree";
import type * as csstree from "@eslint/css-tree";

function parseValue(input: string) {
  const ast = parse(input, { context: "value" }) as csstree.Value;
  const node = ast.children.first;
  if (!node) {
    throw new Error("No node found");
  }
  return parseNodeToCssValue(node);
}

describe("parseNodeToCssValue", () => {
  describe("Complex functions (via dispatcher)", () => {
    it("should parse calc() via dispatcher", () => {
      const result = parseValue("calc(10px + 5px)");
      expect(result.ok).toBe(true);
      expect(result.value?.kind).toBe("calc");
    });

    it("should parse min() via dispatcher", () => {
      const result = parseValue("min(10px, 20px)");
      expect(result.ok).toBe(true);
      expect(result.value?.kind).toBe("min");
    });

    it("should parse max() via dispatcher", () => {
      const result = parseValue("max(10px, 20px)");
      expect(result.ok).toBe(true);
      expect(result.value?.kind).toBe("max");
    });

    it("should parse clamp() via dispatcher", () => {
      const result = parseValue("clamp(10px, 50px, 100px)");
      expect(result.ok).toBe(true);
      expect(result.value?.kind).toBe("clamp");
    });

    it("should parse rgb() via dispatcher", () => {
      const result = parseValue("rgb(255 0 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.kind).toBe("rgb");
    });

    it("should parse hsl() via dispatcher", () => {
      const result = parseValue("hsl(0 100% 50%)");
      expect(result.ok).toBe(true);
      expect(result.value?.kind).toBe("hsl");
    });

    it("should parse hwb() via dispatcher", () => {
      const result = parseValue("hwb(0 0% 0%)");
      expect(result.ok).toBe(true);
      expect(result.value?.kind).toBe("hwb");
    });

    it("should parse lab() via dispatcher", () => {
      const result = parseValue("lab(50% 0 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.kind).toBe("lab");
    });

    it("should parse lch() via dispatcher", () => {
      const result = parseValue("lch(50% 0 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.kind).toBe("lch");
    });

    it("should parse oklab() via dispatcher", () => {
      const result = parseValue("oklab(0.5 0 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.kind).toBe("oklab");
    });

    it("should parse oklch() via dispatcher", () => {
      const result = parseValue("oklch(0.5 0 0)");
      expect(result.ok).toBe(true);
      expect(result.value?.kind).toBe("oklch");
    });
  });

  describe("Primitive values (via basic parser)", () => {
    it("should parse length", () => {
      const result = parseValue("10px");
      expect(result.ok).toBe(true);
      expect(result.value?.kind).toBe("literal");
    });

    it("should parse percentage", () => {
      const result = parseValue("50%");
      expect(result.ok).toBe(true);
      expect(result.value?.kind).toBe("literal");
    });

    it("should parse number", () => {
      const result = parseValue("42");
      expect(result.ok).toBe(true);
      expect(result.value?.kind).toBe("literal");
    });

    it("should parse keyword", () => {
      const result = parseValue("auto");
      expect(result.ok).toBe(true);
      expect(result.value?.kind).toBe("keyword");
    });
  });

  describe("Generic functions (via basic parser)", () => {
    it("should parse var() as variable", () => {
      const result = parseValue("var(--color)");
      expect(result.ok).toBe(true);
      expect(result.value?.kind).toBe("variable");
    });

    it("should parse unknown function as generic", () => {
      const result = parseValue("unknown(value)");
      expect(result.ok).toBe(true);
      expect(result.value?.kind).toBe("function");
    });
  });

  describe("Error handling", () => {
    it("should forward errors from complex functions", () => {
      const result = parseValue("calc()");
      expect(result.ok).toBe(false);
    });

    it("should forward errors from rgb with invalid syntax", () => {
      const result = parseValue("rgb()");
      expect(result.ok).toBe(false);
    });
  });

  describe("Fallback behavior", () => {
    it("should fall back to basic parser when dispatcher returns null", () => {
      const result = parseValue("linear-gradient(red, blue)");
      expect(result.ok).toBe(true);
      expect(result.value?.kind).toBe("function");
    });
  });
});
