// b_path:: packages/b_generators/src/color/hsl.test.ts
import { describe, expect, it } from "vitest";
import type { HSLColor } from "@b/types";
import * as HSL from "./hsl";

const lit = (value: number) => ({ kind: "literal" as const, value });

describe("hsl generator", () => {
  it("should generate opaque HSL color", () => {
    const color: HSLColor = { kind: "hsl", h: lit(120), s: lit(100), l: lit(50) };
    const result = HSL.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("hsl(120 100 50)");
    }
  });

  it("should generate HSL color with alpha", () => {
    const color: HSLColor = { kind: "hsl", h: lit(120), s: lit(100), l: lit(50), alpha: lit(0.5) };
    const result = HSL.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("hsl(120 100 50 / 0.5)");
    }
  });

  it("should omit alpha when fully opaque", () => {
    const color: HSLColor = { kind: "hsl", h: lit(120), s: lit(100), l: lit(50), alpha: lit(1) };
    const result = HSL.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("hsl(120 100 50 / 1)");
    }
  });

  it("should generate red", () => {
    const color: HSLColor = { kind: "hsl", h: lit(0), s: lit(100), l: lit(50) };
    const result = HSL.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("hsl(0 100 50)");
    }
  });

  it("should return error for missing fields", () => {
    const color = { kind: "hsl", h: lit(120) } as HSLColor;
    const result = HSL.generate(color);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.code).toBe("missing-required-field");
    }
  });
});
