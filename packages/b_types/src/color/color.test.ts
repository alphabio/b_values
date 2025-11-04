// b_path:: packages/b_types/src/color/color.test.ts
import { describe, expect, it } from "vitest";
import { colorSchema } from "./color";

const lit = (value: number) => ({ kind: "literal" as const, value });

describe("colorSchema", () => {
  it("validates hex colors", () => {
    const result = colorSchema.safeParse({
      kind: "hex",
      value: "#FF5733",
    });
    expect(result.success).toBe(true);
  });

  it("validates named colors", () => {
    const result = colorSchema.safeParse({
      kind: "named",
      name: "red",
    });
    expect(result.success).toBe(true);
  });

  it("validates RGB colors", () => {
    const result = colorSchema.safeParse({
      kind: "rgb",
      r: lit(255),
      g: lit(87),
      b: lit(51),
    });
    expect(result.success).toBe(true);
  });

  it("validates HSL colors", () => {
    const result = colorSchema.safeParse({
      kind: "hsl",
      h: lit(120),
      s: lit(100),
      l: lit(50),
    });
    expect(result.success).toBe(true);
  });

  it("validates HWB colors", () => {
    const result = colorSchema.safeParse({
      kind: "hwb",
      h: lit(120),
      w: lit(20),
      b: lit(30),
    });
    expect(result.success).toBe(true);
  });

  it("validates LAB colors", () => {
    const result = colorSchema.safeParse({
      kind: "lab",
      l: lit(50),
      a: lit(-20),
      b: lit(30),
    });
    expect(result.success).toBe(true);
  });

  it("validates LCH colors", () => {
    const result = colorSchema.safeParse({
      kind: "lch",
      l: { kind: "literal", value: 50 },
      c: { kind: "literal", value: 50 },
      h: { kind: "literal", value: 180 },
    });
    expect(result.success).toBe(true);
  });

  it("validates OKLab colors", () => {
    const result = colorSchema.safeParse({
      kind: "oklab",
      l: lit(0.5),
      a: lit(-0.2),
      b: lit(0.3),
    });
    expect(result.success).toBe(true);
  });

  it("validates OKLCH colors", () => {
    const result = colorSchema.safeParse({
      kind: "oklch",
      l: lit(0.5),
      c: lit(0.2),
      h: lit(180),
    });
    expect(result.success).toBe(true);
  });

  it("validates special colors", () => {
    const transparent = colorSchema.safeParse({
      kind: "special",
      keyword: "transparent",
    });
    expect(transparent.success).toBe(true);

    const currentcolor = colorSchema.safeParse({
      kind: "special",
      keyword: "currentcolor",
    });
    expect(currentcolor.success).toBe(true);
  });

  it("validates color function", () => {
    const result = colorSchema.safeParse({
      kind: "color",
      colorSpace: "display-p3",
      channels: [lit(0.928), lit(0.322), lit(0.203)],
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid color objects", () => {
    const result = colorSchema.safeParse({
      kind: "invalid",
      value: "something",
    });
    expect(result.success).toBe(false);
  });
});
