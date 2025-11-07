// b_path:: packages/b_parsers/src/utils/color-interpolation.test.ts
import { describe, it, expect } from "vitest";
import * as csstree from "@eslint/css-tree";
import { parseColorInterpolationMethod } from "./color-interpolation";

describe("Color Interpolation Method Parser", () => {
  describe("Basic color spaces", () => {
    it("parses 'in srgb'", () => {
      const ast = csstree.parse("in srgb", { context: "value" }) as csstree.Value;
      const nodes = ast.children.toArray();

      const result = parseColorInterpolationMethod(nodes, 0);

      expect(result).toBeDefined();
      expect(result?.method.colorSpace).toBe("srgb");
      expect(
        result && "hueInterpolationMethod" in result.method ? result.method.hueInterpolationMethod : undefined,
      ).toBeUndefined();
      expect(result?.nextIndex).toBe(2);
    });

    it("parses 'in hsl'", () => {
      const ast = csstree.parse("in hsl", { context: "value" }) as csstree.Value;
      const nodes = ast.children.toArray();

      const result = parseColorInterpolationMethod(nodes, 0);

      expect(result).toBeDefined();
      expect(result?.method.colorSpace).toBe("hsl");
    });

    it("parses 'in oklch'", () => {
      const ast = csstree.parse("in oklch", { context: "value" }) as csstree.Value;
      const nodes = ast.children.toArray();

      const result = parseColorInterpolationMethod(nodes, 0);

      expect(result).toBeDefined();
      expect(result?.method.colorSpace).toBe("oklch");
    });

    it("parses 'in lab'", () => {
      const ast = csstree.parse("in lab", { context: "value" }) as csstree.Value;
      const nodes = ast.children.toArray();

      const result = parseColorInterpolationMethod(nodes, 0);

      expect(result).toBeDefined();
      expect(result?.method.colorSpace).toBe("lab");
    });
  });

  describe("Hue interpolation methods", () => {
    it("parses 'in hsl longer hue'", () => {
      const ast = csstree.parse("in hsl longer hue", { context: "value" }) as csstree.Value;
      const nodes = ast.children.toArray();

      const result = parseColorInterpolationMethod(nodes, 0);

      expect(result).toBeDefined();
      expect(result?.method.colorSpace).toBe("hsl");
      expect(
        result && "hueInterpolationMethod" in result.method ? result.method.hueInterpolationMethod : undefined,
      ).toBe("longer hue");
      expect(result?.nextIndex).toBe(4);
    });

    it("parses 'in oklch shorter hue'", () => {
      const ast = csstree.parse("in oklch shorter hue", { context: "value" }) as csstree.Value;
      const nodes = ast.children.toArray();

      const result = parseColorInterpolationMethod(nodes, 0);

      expect(result).toBeDefined();
      expect(result?.method.colorSpace).toBe("oklch");
      expect(
        result && "hueInterpolationMethod" in result.method ? result.method.hueInterpolationMethod : undefined,
      ).toBe("shorter hue");
    });

    it("parses 'in lch increasing hue'", () => {
      const ast = csstree.parse("in lch increasing hue", { context: "value" }) as csstree.Value;
      const nodes = ast.children.toArray();

      const result = parseColorInterpolationMethod(nodes, 0);

      expect(result).toBeDefined();
      expect(result?.method.colorSpace).toBe("lch");
      expect(
        result && "hueInterpolationMethod" in result.method ? result.method.hueInterpolationMethod : undefined,
      ).toBe("increasing hue");
    });

    it("parses 'in hwb decreasing hue'", () => {
      const ast = csstree.parse("in hwb decreasing hue", { context: "value" }) as csstree.Value;
      const nodes = ast.children.toArray();

      const result = parseColorInterpolationMethod(nodes, 0);

      expect(result).toBeDefined();
      expect(result?.method.colorSpace).toBe("hwb");
      expect(
        result && "hueInterpolationMethod" in result.method ? result.method.hueInterpolationMethod : undefined,
      ).toBe("decreasing hue");
    });
  });

  describe("Invalid cases", () => {
    it("returns undefined when not starting with 'in'", () => {
      const ast = csstree.parse("srgb", { context: "value" }) as csstree.Value;
      const nodes = ast.children.toArray();

      const result = parseColorInterpolationMethod(nodes, 0);

      expect(result).toBeUndefined();
    });

    it("returns undefined when missing color space", () => {
      const ast = csstree.parse("in", { context: "value" }) as csstree.Value;
      const nodes = ast.children.toArray();

      const result = parseColorInterpolationMethod(nodes, 0);

      expect(result).toBeUndefined();
    });

    it("rejects hue method keywords as color spaces", () => {
      const ast = csstree.parse("in longer", { context: "value" }) as csstree.Value;
      const nodes = ast.children.toArray();

      const result = parseColorInterpolationMethod(nodes, 0);

      expect(result).toBeUndefined();
    });

    it("rejects 'shorter' as color space", () => {
      const ast = csstree.parse("in shorter", { context: "value" }) as csstree.Value;
      const nodes = ast.children.toArray();

      const result = parseColorInterpolationMethod(nodes, 0);

      expect(result).toBeUndefined();
    });

    it("rejects 'increasing' as color space", () => {
      const ast = csstree.parse("in increasing", { context: "value" }) as csstree.Value;
      const nodes = ast.children.toArray();

      const result = parseColorInterpolationMethod(nodes, 0);

      expect(result).toBeUndefined();
    });

    it("rejects 'decreasing' as color space", () => {
      const ast = csstree.parse("in decreasing", { context: "value" }) as csstree.Value;
      const nodes = ast.children.toArray();

      const result = parseColorInterpolationMethod(nodes, 0);

      expect(result).toBeUndefined();
    });

    it("returns undefined at wrong startIndex", () => {
      const ast = csstree.parse("red in srgb", { context: "value" }) as csstree.Value;
      const nodes = ast.children.toArray();

      const result = parseColorInterpolationMethod(nodes, 0);

      expect(result).toBeUndefined();
    });

    it("handles incomplete hue method (missing 'hue' keyword)", () => {
      const ast = csstree.parse("in hsl longer", { context: "value" }) as csstree.Value;
      const nodes = ast.children.toArray();

      const result = parseColorInterpolationMethod(nodes, 0);

      expect(result).toBeDefined();
      expect(result?.method.colorSpace).toBe("hsl");
      expect(
        result && "hueInterpolationMethod" in result.method ? result.method.hueInterpolationMethod : undefined,
      ).toBeUndefined();
    });
  });

  describe("Index handling", () => {
    it("returns correct nextIndex for basic color space", () => {
      const ast = csstree.parse("in srgb red blue", { context: "value" }) as csstree.Value;
      const nodes = ast.children.toArray();

      const result = parseColorInterpolationMethod(nodes, 0);

      expect(result?.nextIndex).toBe(2);
      expect(nodes[result?.nextIndex ?? -1]?.type).toBe("Identifier");
    });

    it("returns correct nextIndex with hue method", () => {
      const ast = csstree.parse("in hsl longer hue red blue", { context: "value" }) as csstree.Value;
      const nodes = ast.children.toArray();

      const result = parseColorInterpolationMethod(nodes, 0);

      expect(result?.nextIndex).toBe(4);
      expect(nodes[result?.nextIndex ?? -1]?.type).toBe("Identifier");
    });

    it("works with non-zero startIndex", () => {
      const ast = csstree.parse("red in oklch blue", { context: "value" }) as csstree.Value;
      const nodes = ast.children.toArray();

      const result = parseColorInterpolationMethod(nodes, 1);

      expect(result).toBeDefined();
      expect(result?.method.colorSpace).toBe("oklch");
    });
  });
});
