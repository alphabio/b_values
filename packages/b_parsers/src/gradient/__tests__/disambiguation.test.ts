// b_path:: packages/b_parsers/src/gradient/__tests__/disambiguation.test.ts
import { describe, it, expect } from "vitest";
import * as csstree from "css-tree";
import { disambiguateFirstArg } from "../disambiguation";

/**
 * Test helper: Parse CSS and extract function node children
 */
function parseGradient(css: string): csstree.CssNode[] {
  const ast = csstree.parse(css, { context: "value" });
  let funcNode: csstree.FunctionNode | null = null;

  csstree.walk(ast, {
    enter(node: csstree.CssNode) {
      if (
        node.type === "Function" &&
        (node.name === "linear-gradient" || node.name === "radial-gradient" || node.name === "conic-gradient")
      ) {
        funcNode = node as csstree.FunctionNode;
      }
    },
  });

  if (!funcNode) throw new Error("No gradient function found");
  const func: csstree.FunctionNode = funcNode;
  return func.children.toArray() as csstree.CssNode[];
}

describe("Gradient First Argument Disambiguation", () => {
  describe("Unambiguous: Direction", () => {
    it("identifies angle with unit as direction", () => {
      const children = parseGradient("linear-gradient(45deg, red, blue)");
      expect(disambiguateFirstArg(children)).toBe("direction");
      expect(children[0]?.type).toBe("Dimension"); // 45deg
    });

    it("identifies unitless number as direction", () => {
      const children = parseGradient("linear-gradient(0, red, blue)");
      expect(disambiguateFirstArg(children)).toBe("direction");
      expect(children[0]?.type).toBe("Number"); // 0
    });

    it("identifies 'to' keyword as direction", () => {
      const children = parseGradient("linear-gradient(to right, red, blue)");
      expect(disambiguateFirstArg(children)).toBe("direction");
      expect(children[0]?.type).toBe("Identifier");
      if (children[0]?.type === "Identifier") {
        expect(children[0].name).toBe("to");
      }
    });
  });

  describe("Unambiguous: Color", () => {
    it("identifies hex color as color stop", () => {
      const children = parseGradient("linear-gradient(#ff0000, blue)");
      expect(disambiguateFirstArg(children)).toBe("color");
      expect(children[0]?.type).toBe("Hash");
    });

    it("identifies named color identifier as color stop", () => {
      const children = parseGradient("linear-gradient(red, blue)");
      expect(disambiguateFirstArg(children)).toBe("color");
      expect(children[0]?.type).toBe("Identifier");
      if (children[0]?.type === "Identifier") {
        expect(children[0].name).toBe("red");
      }
    });

    it("identifies rgb() as color stop", () => {
      const children = parseGradient("linear-gradient(rgb(255, 0, 0), blue)");
      expect(disambiguateFirstArg(children)).toBe("color");
      expect(children[0]?.type).toBe("Function");
      if (children[0]?.type === "Function") {
        expect(children[0].name).toBe("rgb");
      }
    });

    it("identifies hsl() as color stop", () => {
      const children = parseGradient("linear-gradient(hsl(0, 100%, 50%), blue)");
      expect(disambiguateFirstArg(children)).toBe("color");
      expect(children[0]?.type).toBe("Function");
      if (children[0]?.type === "Function") {
        expect(children[0].name).toBe("hsl");
      }
    });

    it("identifies rgba() as color stop", () => {
      const children = parseGradient("linear-gradient(rgba(255, 0, 0, 0.5), blue)");
      expect(disambiguateFirstArg(children)).toBe("color");
      expect(children[0]?.type).toBe("Function");
      if (children[0]?.type === "Function") {
        expect(children[0].name).toBe("rgba");
      }
    });

    it("identifies hsla() as color stop", () => {
      const children = parseGradient("linear-gradient(hsla(0, 100%, 50%, 0.5), blue)");
      expect(disambiguateFirstArg(children)).toBe("color");
      expect(children[0]?.type).toBe("Function");
      if (children[0]?.type === "Function") {
        expect(children[0].name).toBe("hsla");
      }
    });

    it("identifies hwb() as color stop", () => {
      const children = parseGradient("linear-gradient(hwb(0 0% 0%), blue)");
      expect(disambiguateFirstArg(children)).toBe("color");
      expect(children[0]?.type).toBe("Function");
      if (children[0]?.type === "Function") {
        expect(children[0].name).toBe("hwb");
      }
    });

    it("identifies lab() as color stop", () => {
      const children = parseGradient("linear-gradient(lab(50% 0 0), blue)");
      expect(disambiguateFirstArg(children)).toBe("color");
      expect(children[0]?.type).toBe("Function");
      if (children[0]?.type === "Function") {
        expect(children[0].name).toBe("lab");
      }
    });

    it("identifies lch() as color stop", () => {
      const children = parseGradient("linear-gradient(lch(50% 0 0), blue)");
      expect(disambiguateFirstArg(children)).toBe("color");
      expect(children[0]?.type).toBe("Function");
      if (children[0]?.type === "Function") {
        expect(children[0].name).toBe("lch");
      }
    });

    it("identifies oklab() as color stop", () => {
      const children = parseGradient("linear-gradient(oklab(0.5 0 0), blue)");
      expect(disambiguateFirstArg(children)).toBe("color");
      expect(children[0]?.type).toBe("Function");
      if (children[0]?.type === "Function") {
        expect(children[0].name).toBe("oklab");
      }
    });

    it("identifies oklch() as color stop", () => {
      const children = parseGradient("linear-gradient(oklch(0.5 0 0), blue)");
      expect(disambiguateFirstArg(children)).toBe("color");
      expect(children[0]?.type).toBe("Function");
      if (children[0]?.type === "Function") {
        expect(children[0].name).toBe("oklch");
      }
    });
  });

  describe("Ambiguous: var() Cases", () => {
    it("var() with 2+ remaining stops → direction", () => {
      const children = parseGradient("linear-gradient(var(--angle), red, blue)");
      expect(disambiguateFirstArg(children)).toBe("direction");
      expect(children[0]?.type).toBe("Function");
      if (children[0]?.type === "Function") {
        expect(children[0].name).toBe("var");
      }
    });

    it("var() with only 1 remaining stop → color", () => {
      const children = parseGradient("linear-gradient(var(--color), blue)");
      expect(disambiguateFirstArg(children)).toBe("color");
      expect(children[0]?.type).toBe("Function");
    });

    it("var() with var() → both colors", () => {
      const children = parseGradient("linear-gradient(var(--c1), var(--c2))");
      expect(disambiguateFirstArg(children)).toBe("color");
      expect(children[0]?.type).toBe("Function");
    });

    it("var() with var() and color → var as direction", () => {
      const children = parseGradient("linear-gradient(var(--angle), var(--color), blue)");
      expect(disambiguateFirstArg(children)).toBe("direction");
      expect(children[0]?.type).toBe("Function");
    });
  });

  describe("Ambiguous: calc() Cases", () => {
    it("calc() with 2+ remaining stops → direction", () => {
      const children = parseGradient("linear-gradient(calc(45deg + 10deg), red, blue)");
      expect(disambiguateFirstArg(children)).toBe("direction");
      expect(children[0]?.type).toBe("Function");
      if (children[0]?.type === "Function") {
        expect(children[0].name).toBe("calc");
      }
    });

    it("calc() with only 1 remaining stop → color", () => {
      const children = parseGradient("linear-gradient(calc(var(--c1) + 0), blue)");
      expect(disambiguateFirstArg(children)).toBe("color");
      expect(children[0]?.type).toBe("Function");
    });
  });

  describe("Ambiguous: clamp() Cases", () => {
    it("clamp() with 2+ remaining stops → direction", () => {
      const children = parseGradient("linear-gradient(clamp(0deg, 45deg, 90deg), red, blue)");
      expect(disambiguateFirstArg(children)).toBe("direction");
      expect(children[0]?.type).toBe("Function");
    });

    it("clamp() with only 1 remaining stop → color", () => {
      const children = parseGradient("linear-gradient(clamp(0, 127, 255), blue)");
      expect(disambiguateFirstArg(children)).toBe("color");
      expect(children[0]?.type).toBe("Function");
    });
  });

  describe("Edge Cases", () => {
    it("handles whitespace correctly", () => {
      const children = parseGradient("linear-gradient( 45deg , red , blue )");
      // Should skip whitespace nodes
      const nonWhitespace = children.filter((n) => n.type !== "WhiteSpace");
      expect(nonWhitespace.length).toBeGreaterThanOrEqual(3);
    });

    it("handles comma-separated positions in stops", () => {
      const children = parseGradient("linear-gradient(45deg, red 0%, yellow 50%, blue 100%)");
      // Direction is unambiguous, should be parsed as direction
      expect(children[0]?.type).toBe("Dimension");
    });

    it("handles nested calc in color stop positions", () => {
      const children = parseGradient("linear-gradient(red, blue calc(50% + 10px))");
      // First arg is named color (unambiguous color)
      expect(children[0]?.type).toBe("Identifier");
    });
  });
});
