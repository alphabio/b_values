// b_path:: packages/b_types/src/color/rgb.test.ts
import { describe, expect, it } from "vitest";
import { rgbColorSchema } from "./rgb";

const lit = (value: number) => ({ kind: "literal" as const, value });

describe("rgbColorSchema", () => {
  it("validates opaque RGB colors", () => {
    const result = rgbColorSchema.safeParse({
      kind: "rgb",
      r: lit(255),
      g: lit(87),
      b: lit(51),
    });
    expect(result.success).toBe(true);
  });

  it("validates RGB colors with alpha", () => {
    const result = rgbColorSchema.safeParse({
      kind: "rgb",
      r: lit(255),
      g: lit(87),
      b: lit(51),
      alpha: lit(0.5),
    });
    expect(result.success).toBe(true);
  });

  it("validates alpha of 0", () => {
    const result = rgbColorSchema.safeParse({
      kind: "rgb",
      r: lit(0),
      g: lit(0),
      b: lit(0),
      alpha: lit(0),
    });
    expect(result.success).toBe(true);
  });

  it("validates alpha of 1", () => {
    const result = rgbColorSchema.safeParse({
      kind: "rgb",
      r: lit(255),
      g: lit(255),
      b: lit(255),
      alpha: lit(1),
    });
    expect(result.success).toBe(true);
  });

  it("rejects wrong kind", () => {
    const result = rgbColorSchema.safeParse({
      kind: "hsl",
      r: lit(255),
      g: lit(87),
      b: lit(51),
    });
    expect(result.success).toBe(false);
  });

  describe("CssValue variants", () => {
    it("accepts variable in r channel", () => {
      const result = rgbColorSchema.safeParse({
        kind: "rgb",
        r: { kind: "variable", name: "--red" },
        g: lit(128),
        b: lit(64),
      });
      expect(result.success).toBe(true);
    });

    it("accepts variables in all channels", () => {
      const result = rgbColorSchema.safeParse({
        kind: "rgb",
        r: { kind: "variable", name: "--r" },
        g: { kind: "variable", name: "--g" },
        b: { kind: "variable", name: "--b" },
      });
      expect(result.success).toBe(true);
    });

    it("accepts variable with fallback", () => {
      const result = rgbColorSchema.safeParse({
        kind: "rgb",
        r: {
          kind: "variable",
          name: "--red",
          fallback: lit(255),
        },
        g: lit(128),
        b: lit(64),
      });
      expect(result.success).toBe(true);
    });

    it("accepts keyword values", () => {
      const result = rgbColorSchema.safeParse({
        kind: "rgb",
        r: { kind: "keyword", value: "none" },
        g: lit(128),
        b: lit(64),
      });
      expect(result.success).toBe(true);
    });

    it("accepts calc() expression", () => {
      const result = rgbColorSchema.safeParse({
        kind: "rgb",
        r: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "+",
            left: lit(100),
            right: lit(20),
          },
        },
        g: lit(128),
        b: lit(64),
      });
      expect(result.success).toBe(true);
    });

    it("accepts calc with variable", () => {
      const result = rgbColorSchema.safeParse({
        kind: "rgb",
        r: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "+",
            left: lit(100),
            right: { kind: "variable", name: "--offset" },
          },
        },
        g: lit(128),
        b: lit(64),
      });
      expect(result.success).toBe(true);
    });

    it("accepts mixed CssValue types", () => {
      const result = rgbColorSchema.safeParse({
        kind: "rgb",
        r: { kind: "variable", name: "--r" },
        g: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "*",
            left: lit(2),
            right: lit(64),
          },
        },
        b: { kind: "keyword", value: "none" },
        alpha: { kind: "variable", name: "--alpha" },
      });
      expect(result.success).toBe(true);
    });

    it("accepts variable alpha", () => {
      const result = rgbColorSchema.safeParse({
        kind: "rgb",
        r: lit(255),
        g: lit(128),
        b: lit(64),
        alpha: { kind: "variable", name: "--opacity" },
      });
      expect(result.success).toBe(true);
    });
  });
});
