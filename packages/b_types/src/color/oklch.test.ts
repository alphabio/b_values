// b_path:: packages/b_types/src/color/oklch.test.ts
import { describe, expect, it } from "vitest";
import { oklchColorSchema } from "./oklch";

describe("oklchColorSchema", () => {
  it("validates opaque OKLCH colors", () => {
    const result = oklchColorSchema.safeParse({
      kind: "oklch",
      l: 0.5,
      c: 0.2,
      h: 180,
    });
    expect(result.success).toBe(true);
  });

  it("validates OKLCH colors with alpha", () => {
    const result = oklchColorSchema.safeParse({
      kind: "oklch",
      l: 0.5,
      c: 0.2,
      h: 180,
      alpha: 0.5,
    });
    expect(result.success).toBe(true);
  });

  it("allows hue wrapping (negative values)", () => {
    const result = oklchColorSchema.safeParse({
      kind: "oklch",
      l: 0.5,
      c: 0.2,
      h: -30,
    });
    expect(result.success).toBe(true);
  });

  it("allows hue wrapping (values above 360)", () => {
    const result = oklchColorSchema.safeParse({
      kind: "oklch",
      l: 0.5,
      c: 0.2,
      h: 420,
    });
    expect(result.success).toBe(true);
  });

  it("rejects wrong kind", () => {
    const result = oklchColorSchema.safeParse({
      kind: "oklab",
      l: 0.5,
      c: 0.2,
      h: 180,
    });
    expect(result.success).toBe(false);
  });
});
