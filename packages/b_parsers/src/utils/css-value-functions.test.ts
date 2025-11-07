// b_path:: packages/b_parsers/src/utils/css-value-functions.test.ts
import { describe, it, expect } from "vitest";
import * as csstree from "@eslint/css-tree";
import { isCssValueFunction } from "./css-value-functions";

describe("CSS Value Function Detector", () => {
  describe("CSS value functions", () => {
    it("identifies var() as CSS value function", () => {
      const ast = csstree.parse("var(--my-var)", { context: "value" }) as csstree.Value;
      const node = ast.children.first!;

      expect(isCssValueFunction(node)).toBe(true);
    });

    it("identifies calc() as CSS value function", () => {
      const ast = csstree.parse("calc(50% + 10px)", { context: "value" }) as csstree.Value;
      const node = ast.children.first!;

      expect(isCssValueFunction(node)).toBe(true);
    });

    it("identifies clamp() as CSS value function", () => {
      const ast = csstree.parse("clamp(10px, 50%, 100px)", { context: "value" }) as csstree.Value;
      const node = ast.children.first!;

      expect(isCssValueFunction(node)).toBe(true);
    });

    it("identifies min() as CSS value function", () => {
      const ast = csstree.parse("min(50%, 100px)", { context: "value" }) as csstree.Value;
      const node = ast.children.first!;

      expect(isCssValueFunction(node)).toBe(true);
    });

    it("identifies max() as CSS value function", () => {
      const ast = csstree.parse("max(50%, 100px)", { context: "value" }) as csstree.Value;
      const node = ast.children.first!;

      expect(isCssValueFunction(node)).toBe(true);
    });
  });

  describe("Color functions", () => {
    it("rejects rgb() as CSS value function", () => {
      const ast = csstree.parse("rgb(255, 0, 0)", { context: "value" }) as csstree.Value;
      const node = ast.children.first!;

      expect(isCssValueFunction(node)).toBe(false);
    });

    it("rejects hsl() as CSS value function", () => {
      const ast = csstree.parse("hsl(0, 100%, 50%)", { context: "value" }) as csstree.Value;
      const node = ast.children.first!;

      expect(isCssValueFunction(node)).toBe(false);
    });

    it("rejects hwb() as CSS value function", () => {
      const ast = csstree.parse("hwb(0 0% 0%)", { context: "value" }) as csstree.Value;
      const node = ast.children.first!;

      expect(isCssValueFunction(node)).toBe(false);
    });

    it("rejects lab() as CSS value function", () => {
      const ast = csstree.parse("lab(50% 0 0)", { context: "value" }) as csstree.Value;
      const node = ast.children.first!;

      expect(isCssValueFunction(node)).toBe(false);
    });

    it("rejects lch() as CSS value function", () => {
      const ast = csstree.parse("lch(50% 0 0)", { context: "value" }) as csstree.Value;
      const node = ast.children.first!;

      expect(isCssValueFunction(node)).toBe(false);
    });

    it("rejects oklch() as CSS value function", () => {
      const ast = csstree.parse("oklch(0.5 0 0)", { context: "value" }) as csstree.Value;
      const node = ast.children.first!;

      expect(isCssValueFunction(node)).toBe(false);
    });

    it("rejects oklab() as CSS value function", () => {
      const ast = csstree.parse("oklab(0.5 0 0)", { context: "value" }) as csstree.Value;
      const node = ast.children.first!;

      expect(isCssValueFunction(node)).toBe(false);
    });

    it("rejects color() as CSS value function", () => {
      const ast = csstree.parse("color(srgb 1 0 0)", { context: "value" }) as csstree.Value;
      const node = ast.children.first!;

      expect(isCssValueFunction(node)).toBe(false);
    });
  });

  describe("Non-function nodes", () => {
    it("returns false for Identifier nodes", () => {
      const ast = csstree.parse("red", { context: "value" }) as csstree.Value;
      const node = ast.children.first!;

      expect(isCssValueFunction(node)).toBe(false);
    });

    it("returns false for Number nodes", () => {
      const ast = csstree.parse("42", { context: "value" }) as csstree.Value;
      const node = ast.children.first!;

      expect(isCssValueFunction(node)).toBe(false);
    });

    it("returns false for Dimension nodes", () => {
      const ast = csstree.parse("10px", { context: "value" }) as csstree.Value;
      const node = ast.children.first!;

      expect(isCssValueFunction(node)).toBe(false);
    });

    it("returns false for Percentage nodes", () => {
      const ast = csstree.parse("50%", { context: "value" }) as csstree.Value;
      const node = ast.children.first!;

      expect(isCssValueFunction(node)).toBe(false);
    });

    it("returns false for String nodes", () => {
      const ast = csstree.parse('"hello"', { context: "value" }) as csstree.Value;
      const node = ast.children.first!;

      expect(isCssValueFunction(node)).toBe(false);
    });
  });

  describe("Case sensitivity", () => {
    it("handles uppercase VAR()", () => {
      const ast = csstree.parse("VAR(--test)", { context: "value" }) as csstree.Value;
      const node = ast.children.first!;

      expect(isCssValueFunction(node)).toBe(true);
    });

    it("handles mixed case CaLc()", () => {
      const ast = csstree.parse("CaLc(10px + 5px)", { context: "value" }) as csstree.Value;
      const node = ast.children.first!;

      expect(isCssValueFunction(node)).toBe(true);
    });

    it("handles uppercase RGB() still returns false", () => {
      const ast = csstree.parse("RGB(255, 0, 0)", { context: "value" }) as csstree.Value;
      const node = ast.children.first!;

      expect(isCssValueFunction(node)).toBe(false);
    });
  });
});
