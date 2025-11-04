// b_path:: packages/b_types/src/color/color.test.ts
import { describe, expect, it } from "vitest";
import { colorSchema } from "./color";

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
      r: 255,
      g: 87,
      b: 51,
    });
    expect(result.success).toBe(true);
  });

  it("validates HSL colors", () => {
    const result = colorSchema.safeParse({
      kind: "hsl",
      h: 120,
      s: 100,
      l: 50,
    });
    expect(result.success).toBe(true);
  });

  it("validates HWB colors", () => {
    const result = colorSchema.safeParse({
      kind: "hwb",
      h: 120,
      w: 20,
      b: 30,
    });
    expect(result.success).toBe(true);
  });

  it("validates LAB colors", () => {
    const result = colorSchema.safeParse({
      kind: "lab",
      l: 50,
      a: -20,
      b: 30,
    });
    expect(result.success).toBe(true);
  });

  it("validates LCH colors", () => {
    const result = colorSchema.safeParse({
      kind: "lch",
      l: 50,
      c: 50,
      h: 180,
    });
    expect(result.success).toBe(true);
  });

  it("validates OKLab colors", () => {
    const result = colorSchema.safeParse({
      kind: "oklab",
      l: 0.5,
      a: -0.2,
      b: 0.3,
    });
    expect(result.success).toBe(true);
  });

  it("validates OKLCH colors", () => {
    const result = colorSchema.safeParse({
      kind: "oklch",
      l: 0.5,
      c: 0.2,
      h: 180,
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
      channels: [0.928, 0.322, 0.203],
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
