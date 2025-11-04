// b_path:: packages/b_generators/src/color/hsl.test.ts
import { describe, expect, it } from "vitest";
import type { HSLColor } from "@b/types";
import * as HSL from "./hsl";

const lit = (value: number) => ({ kind: "literal" as const, value });

describe("hsl generator", () => {
  it("should generate opaque HSL color", () => {
    const color: HSLColor = { kind: "hsl", h: lit(120), s: lit(100), l: lit(50) };
    const result = HSL.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("hsl(120 100 50)");
    }
  });

  it("should generate HSL color with alpha", () => {
    const color: HSLColor = { kind: "hsl", h: lit(120), s: lit(100), l: lit(50), alpha: lit(0.5) };
    const result = HSL.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("hsl(120 100 50 / 0.5)");
    }
  });

  it("should omit alpha when fully opaque", () => {
    const color: HSLColor = { kind: "hsl", h: lit(120), s: lit(100), l: lit(50), alpha: lit(1) };
    const result = HSL.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("hsl(120 100 50 / 1)");
    }
  });

  it("should generate red", () => {
    const color: HSLColor = { kind: "hsl", h: lit(0), s: lit(100), l: lit(50) };
    const result = HSL.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("hsl(0 100 50)");
    }
  });

  it("should return error for missing fields", () => {
    const color = { kind: "hsl", h: lit(120) } as HSLColor;
    const result = HSL.generate(color);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.code).toBe("missing-required-field");
    }
  });

  describe("CssValue variants", () => {
    it("should generate HSL with variable in hue", () => {
      const color: HSLColor = {
        kind: "hsl",
        h: { kind: "variable", name: "--hue" },
        s: lit(100),
        l: lit(50),
      };
      const result = HSL.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("hsl(var(--hue) 100 50)");
      }
    });

    it("should generate HSL with variables in all channels", () => {
      const color: HSLColor = {
        kind: "hsl",
        h: { kind: "variable", name: "--h" },
        s: { kind: "variable", name: "--s" },
        l: { kind: "variable", name: "--l" },
      };
      const result = HSL.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("hsl(var(--h) var(--s) var(--l))");
      }
    });

    it("should generate HSL with keyword 'none'", () => {
      const color: HSLColor = {
        kind: "hsl",
        h: lit(120),
        s: { kind: "keyword", value: "none" },
        l: lit(50),
      };
      const result = HSL.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("hsl(120 none 50)");
      }
    });

    it("should generate HSL with calc in hue", () => {
      const color: HSLColor = {
        kind: "hsl",
        h: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "+",
            left: { kind: "literal", value: 90, unit: "deg" },
            right: { kind: "literal", value: 30, unit: "deg" },
          },
        },
        s: lit(100),
        l: lit(50),
      };
      const result = HSL.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("hsl(calc(90deg + 30deg) 100 50)");
      }
    });

    it("should generate HSL with calc and variable", () => {
      const color: HSLColor = {
        kind: "hsl",
        h: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "+",
            left: { kind: "variable", name: "--base-hue" },
            right: lit(30),
          },
        },
        s: lit(100),
        l: lit(50),
      };
      const result = HSL.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("hsl(calc(var(--base-hue) + 30) 100 50)");
      }
    });

    it("should generate HSL with mixed CssValue types", () => {
      const color: HSLColor = {
        kind: "hsl",
        h: { kind: "variable", name: "--hue" },
        s: { kind: "keyword", value: "none" },
        l: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "/",
            left: lit(100),
            right: lit(2),
          },
        },
        alpha: { kind: "variable", name: "--opacity" },
      };
      const result = HSL.generate(color);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("hsl(var(--hue) none calc(100 / 2) / var(--opacity))");
      }
    });
  });
});
