// b_path:: packages/b_types/src/color/oklab.test.ts
import { describe, expect, it } from "vitest";
import { oklabColorSchema } from "./oklab";

const lit = (value: number) => ({ kind: "literal" as const, value });

describe("oklabColorSchema", () => {
  it("validates opaque OKLab colors", () => {
    const result = oklabColorSchema.safeParse({
      kind: "oklab",
      l: lit(0.5),
      a: lit(-0.2),
      b: lit(0.3),
    });
    expect(result.success).toBe(true);
  });

  it("validates OKLab colors with alpha", () => {
    const result = oklabColorSchema.safeParse({
      kind: "oklab",
      l: lit(0.5),
      a: lit(-0.2),
      b: lit(0.3),
      alpha: lit(0.5),
    });
    expect(result.success).toBe(true);
  });

  it("validates lightness at 0", () => {
    const result = oklabColorSchema.safeParse({
      kind: "oklab",
      l: lit(0),
      a: lit(0),
      b: lit(0),
    });
    expect(result.success).toBe(true);
  });

  it("validates lightness at 1", () => {
    const result = oklabColorSchema.safeParse({
      kind: "oklab",
      l: lit(1),
      a: lit(0),
      b: lit(0),
    });
    expect(result.success).toBe(true);
  });

  it("validates a at -0.4", () => {
    const result = oklabColorSchema.safeParse({
      kind: "oklab",
      l: lit(0.5),
      a: lit(-0.4),
      b: lit(0),
    });
    expect(result.success).toBe(true);
  });

  it("validates a at 0.4", () => {
    const result = oklabColorSchema.safeParse({
      kind: "oklab",
      l: lit(0.5),
      a: lit(0.4),
      b: lit(0),
    });
    expect(result.success).toBe(true);
  });

  it("validates b at -0.4", () => {
    const result = oklabColorSchema.safeParse({
      kind: "oklab",
      l: lit(0.5),
      a: lit(0),
      b: lit(-0.4),
    });
    expect(result.success).toBe(true);
  });

  it("validates b at 0.4", () => {
    const result = oklabColorSchema.safeParse({
      kind: "oklab",
      l: lit(0.5),
      a: lit(0),
      b: lit(0.4),
    });
    expect(result.success).toBe(true);
  });

  it("rejects wrong kind", () => {
    const result = oklabColorSchema.safeParse({
      kind: "oklch",
      l: lit(0.5),
      a: lit(-0.2),
      b: lit(0.3),
    });
    expect(result.success).toBe(false);
  });

  describe("CssValue variants", () => {
    it("accepts variable in l channel", () => {
      const result = oklabColorSchema.safeParse({
        kind: "oklab",
        l: { kind: "variable", name: "--lightness" },
        a: lit(-0.2),
        b: lit(0.3),
      });
      expect(result.success).toBe(true);
    });

    it("accepts variables in all channels", () => {
      const result = oklabColorSchema.safeParse({
        kind: "oklab",
        l: { kind: "variable", name: "--l" },
        a: { kind: "variable", name: "--a" },
        b: { kind: "variable", name: "--b" },
      });
      expect(result.success).toBe(true);
    });

    it("accepts keyword values", () => {
      const result = oklabColorSchema.safeParse({
        kind: "oklab",
        l: lit(0.5),
        a: { kind: "keyword", value: "none" },
        b: lit(0.3),
      });
      expect(result.success).toBe(true);
    });

    it("accepts calc expression", () => {
      const result = oklabColorSchema.safeParse({
        kind: "oklab",
        l: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "+",
            left: lit(0.5),
            right: { kind: "variable", name: "--offset" },
          },
        },
        a: lit(-0.2),
        b: lit(0.3),
      });
      expect(result.success).toBe(true);
    });

    it("accepts mixed CssValue types", () => {
      const result = oklabColorSchema.safeParse({
        kind: "oklab",
        l: { kind: "variable", name: "--l" },
        a: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "*",
            left: lit(-0.1),
            right: lit(2),
          },
        },
        b: { kind: "keyword", value: "none" },
        alpha: { kind: "variable", name: "--opacity" },
      });
      expect(result.success).toBe(true);
    });
  });
});
