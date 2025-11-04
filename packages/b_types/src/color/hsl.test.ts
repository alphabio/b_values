// b_path:: packages/b_types/src/color/hsl.test.ts
import { describe, expect, it } from "vitest";
import { hslColorSchema } from "./hsl";

const lit = (value: number) => ({ kind: "literal" as const, value });

describe("hslColorSchema", () => {
  it("validates opaque HSL colors", () => {
    const result = hslColorSchema.safeParse({
      kind: "hsl",
      h: lit(120),
      s: lit(100),
      l: lit(50),
    });
    expect(result.success).toBe(true);
  });

  it("validates HSL colors with alpha", () => {
    const result = hslColorSchema.safeParse({
      kind: "hsl",
      h: lit(120),
      s: lit(100),
      l: lit(50),
      alpha: lit(0.5),
    });
    expect(result.success).toBe(true);
  });

  it("allows hue wrapping (negative values)", () => {
    const result = hslColorSchema.safeParse({
      kind: "hsl",
      h: lit(-30),
      s: lit(50),
      l: lit(50),
    });
    expect(result.success).toBe(true);
  });

  it("allows hue wrapping (values above 360)", () => {
    const result = hslColorSchema.safeParse({
      kind: "hsl",
      h: lit(420),
      s: lit(50),
      l: lit(50),
    });
    expect(result.success).toBe(true);
  });

  it("rejects wrong kind", () => {
    const result = hslColorSchema.safeParse({
      kind: "rgb",
      h: lit(120),
      s: lit(100),
      l: lit(50),
    });
    expect(result.success).toBe(false);
  });

  describe("CssValue variants", () => {
    it("accepts variable in hue", () => {
      const result = hslColorSchema.safeParse({
        kind: "hsl",
        h: { kind: "variable", name: "--hue" },
        s: lit(100),
        l: lit(50),
      });
      expect(result.success).toBe(true);
    });

    it("accepts variables in all channels", () => {
      const result = hslColorSchema.safeParse({
        kind: "hsl",
        h: { kind: "variable", name: "--h" },
        s: { kind: "variable", name: "--s" },
        l: { kind: "variable", name: "--l" },
      });
      expect(result.success).toBe(true);
    });

    it("accepts keyword 'none' value", () => {
      const result = hslColorSchema.safeParse({
        kind: "hsl",
        h: lit(120),
        s: { kind: "keyword", value: "none" },
        l: lit(50),
      });
      expect(result.success).toBe(true);
    });

    it("accepts calc in hue with degree", () => {
      const result = hslColorSchema.safeParse({
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
      });
      expect(result.success).toBe(true);
    });

    it("accepts calc with variable", () => {
      const result = hslColorSchema.safeParse({
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
      });
      expect(result.success).toBe(true);
    });

    it("accepts mixed CssValue types", () => {
      const result = hslColorSchema.safeParse({
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
      });
      expect(result.success).toBe(true);
    });
  });
});
