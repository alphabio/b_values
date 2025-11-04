// b_path:: packages/b_types/src/color/hsl.test.ts
import { describe, expect, it } from "vitest";
import { hslColorSchema } from "./hsl";

describe("hslColorSchema", () => {
  it("validates opaque HSL colors", () => {
    const result = hslColorSchema.safeParse({
      kind: "hsl",
      h: 120,
      s: 100,
      l: 50,
    });
    expect(result.success).toBe(true);
  });

  it("validates HSL colors with alpha", () => {
    const result = hslColorSchema.safeParse({
      kind: "hsl",
      h: 120,
      s: 100,
      l: 50,
      alpha: 0.5,
    });
    expect(result.success).toBe(true);
  });

  it("allows hue wrapping (negative values)", () => {
    const result = hslColorSchema.safeParse({
      kind: "hsl",
      h: -30,
      s: 50,
      l: 50,
    });
    expect(result.success).toBe(true);
  });

  it("allows hue wrapping (values above 360)", () => {
    const result = hslColorSchema.safeParse({
      kind: "hsl",
      h: 420,
      s: 50,
      l: 50,
    });
    expect(result.success).toBe(true);
  });

  it("rejects saturation below 0", () => {
    const result = hslColorSchema.safeParse({
      kind: "hsl",
      h: 120,
      s: -1,
      l: 50,
    });
    expect(result.success).toBe(false);
  });

  it("rejects saturation above 100", () => {
    const result = hslColorSchema.safeParse({
      kind: "hsl",
      h: 120,
      s: 101,
      l: 50,
    });
    expect(result.success).toBe(false);
  });

  it("rejects lightness below 0", () => {
    const result = hslColorSchema.safeParse({
      kind: "hsl",
      h: 120,
      s: 50,
      l: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects lightness above 100", () => {
    const result = hslColorSchema.safeParse({
      kind: "hsl",
      h: 120,
      s: 50,
      l: 101,
    });
    expect(result.success).toBe(false);
  });

  it("rejects alpha below 0", () => {
    const result = hslColorSchema.safeParse({
      kind: "hsl",
      h: 120,
      s: 50,
      l: 50,
      alpha: -0.1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects alpha above 1", () => {
    const result = hslColorSchema.safeParse({
      kind: "hsl",
      h: 120,
      s: 50,
      l: 50,
      alpha: 1.1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects wrong kind", () => {
    const result = hslColorSchema.safeParse({
      kind: "rgb",
      h: 120,
      s: 100,
      l: 50,
    });
    expect(result.success).toBe(false);
  });
});
