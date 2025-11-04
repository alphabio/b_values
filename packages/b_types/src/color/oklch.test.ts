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
});
