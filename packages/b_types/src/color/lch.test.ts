// b_path:: packages/b_types/src/color/lch.test.ts
import { describe, expect, it } from "vitest";
import { lchColorSchema } from "./lch";

describe("lchColorSchema", () => {
  it("validates opaque LCH colors", () => {
    const result = lchColorSchema.safeParse({
      kind: "lch",
      l: 50,
      c: 50,
      h: 180,
    });
    expect(result.success).toBe(true);
  });

  it("validates LCH colors with alpha", () => {
    const result = lchColorSchema.safeParse({
      kind: "lch",
      l: 50,
      c: 50,
      h: 180,
      alpha: 0.5,
    });
    expect(result.success).toBe(true);
  });

  it("allows hue wrapping (negative values)", () => {
    const result = lchColorSchema.safeParse({
      kind: "lch",
      l: 50,
      c: 50,
      h: -30,
    });
    expect(result.success).toBe(true);
  });

  it("allows hue wrapping (values above 360)", () => {
    const result = lchColorSchema.safeParse({
      kind: "lch",
      l: 50,
      c: 50,
      h: 420,
    });
    expect(result.success).toBe(true);
  });

  it("rejects lightness below 0", () => {
    const result = lchColorSchema.safeParse({
      kind: "lch",
      l: -1,
      c: 50,
      h: 180,
    });
    expect(result.success).toBe(false);
  });

  it("rejects lightness above 100", () => {
    const result = lchColorSchema.safeParse({
      kind: "lch",
      l: 101,
      c: 50,
      h: 180,
    });
    expect(result.success).toBe(false);
  });

  it("rejects chroma below 0", () => {
    const result = lchColorSchema.safeParse({
      kind: "lch",
      l: 50,
      c: -1,
      h: 180,
    });
    expect(result.success).toBe(false);
  });

  it("rejects chroma above 150", () => {
    const result = lchColorSchema.safeParse({
      kind: "lch",
      l: 50,
      c: 151,
      h: 180,
    });
    expect(result.success).toBe(false);
  });

  it("rejects alpha below 0", () => {
    const result = lchColorSchema.safeParse({
      kind: "lch",
      l: 50,
      c: 50,
      h: 180,
      alpha: -0.1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects alpha above 1", () => {
    const result = lchColorSchema.safeParse({
      kind: "lch",
      l: 50,
      c: 50,
      h: 180,
      alpha: 1.1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects wrong kind", () => {
    const result = lchColorSchema.safeParse({
      kind: "lab",
      l: 50,
      c: 50,
      h: 180,
    });
    expect(result.success).toBe(false);
  });
});
