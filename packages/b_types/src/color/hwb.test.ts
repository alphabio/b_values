// b_path:: packages/b_types/src/color/hwb.test.ts
import { describe, expect, it } from "vitest";
import { hwbColorSchema } from "./hwb";

const lit = (value: number) => ({ kind: "literal" as const, value });

describe("hwbColorSchema", () => {
  it("validates opaque HWB colors", () => {
    const result = hwbColorSchema.safeParse({
      kind: "hwb",
      h: lit(120),
      w: lit(20),
      b: lit(30),
    });
    expect(result.success).toBe(true);
  });

  it("validates HWB colors with alpha", () => {
    const result = hwbColorSchema.safeParse({
      kind: "hwb",
      h: lit(120),
      w: lit(20),
      b: lit(30),
      alpha: lit(0.5),
    });
    expect(result.success).toBe(true);
  });

  it("allows hue wrapping (negative values)", () => {
    const result = hwbColorSchema.safeParse({
      kind: "hwb",
      h: lit(-30),
      w: lit(20),
      b: lit(30),
    });
    expect(result.success).toBe(true);
  });

  it("allows hue wrapping (values above 360)", () => {
    const result = hwbColorSchema.safeParse({
      kind: "hwb",
      h: lit(420),
      w: lit(20),
      b: lit(30),
    });
    expect(result.success).toBe(true);
  });

  it("rejects wrong kind", () => {
    const result = hwbColorSchema.safeParse({
      kind: "hsl",
      h: lit(120),
      w: lit(20),
      b: lit(30),
    });
    expect(result.success).toBe(false);
  });

  describe("CssValue variants", () => {
    it("accepts variable in hue", () => {
      const result = hwbColorSchema.safeParse({
        kind: "hwb",
        h: { kind: "variable", name: "--hue" },
        w: lit(20),
        b: lit(30),
      });
      expect(result.success).toBe(true);
    });

    it("accepts variables in all channels", () => {
      const result = hwbColorSchema.safeParse({
        kind: "hwb",
        h: { kind: "variable", name: "--h" },
        w: { kind: "variable", name: "--w" },
        b: { kind: "variable", name: "--b" },
      });
      expect(result.success).toBe(true);
    });

    it("accepts keyword values", () => {
      const result = hwbColorSchema.safeParse({
        kind: "hwb",
        h: lit(120),
        w: { kind: "keyword", value: "none" },
        b: lit(30),
      });
      expect(result.success).toBe(true);
    });

    it("accepts calc in hue", () => {
      const result = hwbColorSchema.safeParse({
        kind: "hwb",
        h: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "+",
            left: { kind: "literal", value: 180, unit: "deg" },
            right: { kind: "literal", value: 60, unit: "deg" },
          },
        },
        w: lit(20),
        b: lit(30),
      });
      expect(result.success).toBe(true);
    });

    it("accepts mixed CssValue types", () => {
      const result = hwbColorSchema.safeParse({
        kind: "hwb",
        h: { kind: "variable", name: "--hue" },
        w: {
          kind: "calc",
          value: {
            kind: "calc-operation",
            operator: "/",
            left: lit(40),
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
