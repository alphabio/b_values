// b_path:: packages/b_types/src/color/oklch.test.ts
import { describe, expect, it } from "vitest";
import { oklchColorSchema } from "./oklch";

const lit = (value: number) => ({ kind: "literal" as const, value });

describe("oklchColorSchema", () => {
  it("validates opaque OKLCH colors", () => {
    const result = oklchColorSchema.safeParse({
      kind: "oklch",
      l: lit(0.5),
      c: lit(0.2),
      h: lit(180),
    });
    expect(result.success).toBe(true);
  });

  it("validates OKLCH colors with alpha", () => {
    const result = oklchColorSchema.safeParse({
      kind: "oklch",
      l: lit(0.5),
      c: lit(0.2),
      h: lit(180),
      alpha: lit(0.5),
    });
    expect(result.success).toBe(true);
  });

  it("allows hue wrapping (negative values)", () => {
    const result = oklchColorSchema.safeParse({
      kind: "oklch",
      l: lit(0.5),
      c: lit(0.2),
      h: lit(-30),
    });
    expect(result.success).toBe(true);
  });

  it("allows hue wrapping (values above 360)", () => {
    const result = oklchColorSchema.safeParse({
      kind: "oklch",
      l: lit(0.5),
      c: lit(0.2),
      h: lit(420),
    });
    expect(result.success).toBe(true);
  });

  it("rejects wrong kind", () => {
    const result = oklchColorSchema.safeParse({
      kind: "oklab",
      l: lit(0.5),
      c: lit(0.2),
      h: lit(180),
    });
    expect(result.success).toBe(false);
  });

  describe("CssValue variants", () => {
    it("accepts variable in l channel", () => {
      const result = oklchColorSchema.safeParse({
        kind: "oklch",
        l: { kind: "variable", name: "--lightness" },
        c: lit(0.2),
        h: lit(180),
      });
      expect(result.success).toBe(true);
    });

    it("accepts variables in all channels", () => {
      const result = oklchColorSchema.safeParse({
        kind: "oklch",
        l: { kind: "variable", name: "--l" },
        c: { kind: "variable", name: "--c" },
        h: { kind: "variable", name: "--h" },
      });
      expect(result.success).toBe(true);
    });

    it("accepts keyword values", () => {
      const result = oklchColorSchema.safeParse({
        kind: "oklch",
        l: lit(0.5),
        c: { kind: "keyword", value: "none" },
        h: lit(180),
      });
      expect(result.success).toBe(true);
    });

    it("accepts calc in hue", () => {
      const result = oklchColorSchema.safeParse({
        kind: "oklch",
        l: lit(0.5),
        c: lit(0.2),
        h: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "+",
            left: { kind: "literal", value: 180, unit: "deg" },
            right: { kind: "literal", value: 45, unit: "deg" },
          },
        },
      });
      expect(result.success).toBe(true);
    });

    it("accepts mixed CssValue types", () => {
      const result = oklchColorSchema.safeParse({
        kind: "oklch",
        l: { kind: "variable", name: "--l" },
        c: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "*",
            left: lit(0.1),
            right: lit(2),
          },
        },
        h: { kind: "keyword", value: "none" },
        alpha: { kind: "variable", name: "--opacity" },
      });
      expect(result.success).toBe(true);
    });
  });
});
