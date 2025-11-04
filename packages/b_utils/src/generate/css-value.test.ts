// b_path:: packages/b_utils/src/generate/css-value.test.ts
import { describe, expect, it } from "vitest";
import { cssValueToCss } from "./css-value";
import type { CssValue } from "@b/types";

describe("cssValueToCss", () => {
  describe("literal values", () => {
    it("should generate unitless literal", () => {
      const value: CssValue = { kind: "literal", value: 42 };
      expect(cssValueToCss(value)).toBe("42");
    });

    it("should generate literal with unit", () => {
      const value: CssValue = { kind: "literal", value: 10, unit: "px" };
      expect(cssValueToCss(value)).toBe("10px");
    });

    it("should generate literal with percentage", () => {
      const value: CssValue = { kind: "literal", value: 50, unit: "%" };
      expect(cssValueToCss(value)).toBe("50%");
    });

    it("should generate literal with degree", () => {
      const value: CssValue = { kind: "literal", value: 90, unit: "deg" };
      expect(cssValueToCss(value)).toBe("90deg");
    });
  });

  describe("variable references", () => {
    it("should generate simple variable", () => {
      const value: CssValue = { kind: "variable", name: "--my-color" };
      expect(cssValueToCss(value)).toBe("var(--my-color)");
    });

    it("should generate variable with fallback", () => {
      const value: CssValue = {
        kind: "variable",
        name: "--my-color",
        fallback: { kind: "literal", value: 255 },
      };
      expect(cssValueToCss(value)).toBe("var(--my-color, 255)");
    });

    it("should generate variable with nested fallback", () => {
      const value: CssValue = {
        kind: "variable",
        name: "--primary",
        fallback: {
          kind: "variable",
          name: "--secondary",
          fallback: { kind: "literal", value: 0 },
        },
      };
      expect(cssValueToCss(value)).toBe("var(--primary, var(--secondary, 0))");
    });
  });

  describe("keyword values", () => {
    it("should generate keyword", () => {
      const value: CssValue = { kind: "keyword", value: "none" };
      expect(cssValueToCss(value)).toBe("none");
    });

    it("should generate keyword 'auto'", () => {
      const value: CssValue = { kind: "keyword", value: "auto" };
      expect(cssValueToCss(value)).toBe("auto");
    });
  });

  describe("list values", () => {
    it("should generate space-separated list", () => {
      const value: CssValue = {
        kind: "list",
        separator: " ",
        values: [
          { kind: "literal", value: 10, unit: "px" },
          { kind: "literal", value: 20, unit: "px" },
        ],
      };
      expect(cssValueToCss(value)).toBe("10px 20px");
    });

    it("should generate comma-separated list", () => {
      const value: CssValue = {
        kind: "list",
        separator: ",",
        values: [
          { kind: "literal", value: 1 },
          { kind: "literal", value: 2 },
          { kind: "literal", value: 3 },
        ],
      };
      expect(cssValueToCss(value)).toBe("1,2,3");
    });
  });

  describe("calc function", () => {
    it("should generate calc with operation", () => {
      const value: CssValue = {
        kind: "calc",
        value: {
          kind: "calc-operation",
          operator: "+",
          left: { kind: "literal", value: 100, unit: "px" },
          right: { kind: "literal", value: 50, unit: "px" },
        },
      };
      expect(cssValueToCss(value)).toBe("calc(100px + 50px)");
    });

    it("should generate calc with subtraction", () => {
      const value: CssValue = {
        kind: "calc",
        value: {
          kind: "calc-operation",
          operator: "-",
          left: { kind: "literal", value: 100, unit: "%" },
          right: { kind: "literal", value: 20, unit: "px" },
        },
      };
      expect(cssValueToCss(value)).toBe("calc(100% - 20px)");
    });

    it("should generate calc with multiplication", () => {
      const value: CssValue = {
        kind: "calc",
        value: {
          kind: "calc-operation",
          operator: "*",
          left: { kind: "literal", value: 2 },
          right: { kind: "literal", value: 50, unit: "px" },
        },
      };
      expect(cssValueToCss(value)).toBe("calc(2 * 50px)");
    });

    it("should generate calc with division", () => {
      const value: CssValue = {
        kind: "calc",
        value: {
          kind: "calc-operation",
          operator: "/",
          left: { kind: "literal", value: 100, unit: "px" },
          right: { kind: "literal", value: 2 },
        },
      };
      expect(cssValueToCss(value)).toBe("calc(100px / 2)");
    });

    it("should generate calc with variable", () => {
      const value: CssValue = {
        kind: "calc",
        value: {
          kind: "calc-operation",
          operator: "+",
          left: { kind: "variable", name: "--base" },
          right: { kind: "literal", value: 10, unit: "px" },
        },
      };
      expect(cssValueToCss(value)).toBe("calc(var(--base) + 10px)");
    });
  });

  describe("min function", () => {
    it("should generate min with two values", () => {
      const value: CssValue = {
        kind: "min",
        values: [
          { kind: "literal", value: 100, unit: "px" },
          { kind: "literal", value: 50, unit: "%" },
        ],
      };
      expect(cssValueToCss(value)).toBe("min(100px, 50%)");
    });

    it("should generate min with multiple values", () => {
      const value: CssValue = {
        kind: "min",
        values: [
          { kind: "literal", value: 100, unit: "px" },
          { kind: "literal", value: 50, unit: "%" },
          { kind: "variable", name: "--max-width" },
        ],
      };
      expect(cssValueToCss(value)).toBe("min(100px, 50%, var(--max-width))");
    });
  });

  describe("max function", () => {
    it("should generate max with two values", () => {
      const value: CssValue = {
        kind: "max",
        values: [
          { kind: "literal", value: 100, unit: "px" },
          { kind: "literal", value: 50, unit: "%" },
        ],
      };
      expect(cssValueToCss(value)).toBe("max(100px, 50%)");
    });

    it("should generate max with multiple values", () => {
      const value: CssValue = {
        kind: "max",
        values: [
          { kind: "literal", value: 10, unit: "px" },
          { kind: "literal", value: 5, unit: "%" },
          { kind: "literal", value: 1, unit: "rem" },
        ],
      };
      expect(cssValueToCss(value)).toBe("max(10px, 5%, 1rem)");
    });
  });

  describe("clamp function", () => {
    it("should generate clamp with three values", () => {
      const value: CssValue = {
        kind: "clamp",
        min: { kind: "literal", value: 10, unit: "px" },
        preferred: { kind: "literal", value: 50, unit: "%" },
        max: { kind: "literal", value: 100, unit: "px" },
      };
      expect(cssValueToCss(value)).toBe("clamp(10px, 50%, 100px)");
    });

    it("should generate clamp with variables", () => {
      const value: CssValue = {
        kind: "clamp",
        min: { kind: "variable", name: "--min-size" },
        preferred: { kind: "literal", value: 5, unit: "vw" },
        max: { kind: "variable", name: "--max-size" },
      };
      expect(cssValueToCss(value)).toBe("clamp(var(--min-size), 5vw, var(--max-size))");
    });
  });

  describe("url function", () => {
    it("should generate url", () => {
      const value: CssValue = {
        kind: "url",
        url: "image.png",
      };
      expect(cssValueToCss(value)).toBe("url(image.png)");
    });

    it("should generate url with path", () => {
      const value: CssValue = {
        kind: "url",
        url: "/images/background.jpg",
      };
      expect(cssValueToCss(value)).toBe("url(/images/background.jpg)");
    });
  });

  describe("attr function", () => {
    it("should generate attr with name only", () => {
      const value: CssValue = {
        kind: "attr",
        name: "data-width",
      };
      expect(cssValueToCss(value)).toBe("attr(data-width)");
    });

    it("should generate attr with type", () => {
      const value: CssValue = {
        kind: "attr",
        name: "data-width",
        typeOrUnit: "px",
      };
      expect(cssValueToCss(value)).toBe("attr(data-width px)");
    });

    it("should generate attr with fallback", () => {
      const value: CssValue = {
        kind: "attr",
        name: "data-width",
        fallback: { kind: "literal", value: 100, unit: "px" },
      };
      expect(cssValueToCss(value)).toBe("attr(data-width, 100px)");
    });

    it("should generate attr with type and fallback", () => {
      const value: CssValue = {
        kind: "attr",
        name: "data-color",
        typeOrUnit: "color",
        fallback: { kind: "keyword", value: "red" },
      };
      expect(cssValueToCss(value)).toBe("attr(data-color color, red)");
    });
  });
});
