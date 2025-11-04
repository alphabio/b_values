// b_path:: packages/b_generators/src/color/rgb.test.ts
import { describe, expect, it } from "vitest";
import type { RGBColor } from "@b/types";
import * as RGB from "./rgb";

const lit = (value: number) => ({ kind: "literal" as const, value });

describe("rgb generator", () => {
  it("should generate opaque RGB color", () => {
    const color: RGBColor = { kind: "rgb", r: lit(255), g: lit(0), b: lit(0) };
    const result = RGB.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("rgb(255 0 0)");
    }
  });

  it("should generate RGB color with alpha", () => {
    const color: RGBColor = { kind: "rgb", r: lit(255), g: lit(0), b: lit(0), alpha: lit(0.5) };
    const result = RGB.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("rgb(255 0 0 / 0.5)");
    }
  });

  it("should omit alpha when fully opaque", () => {
    const color: RGBColor = { kind: "rgb", r: lit(255), g: lit(0), b: lit(0), alpha: lit(1) };
    const result = RGB.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("rgb(255 0 0 / 1)");
    }
  });

  it("should round RGB values to integers", () => {
    const color: RGBColor = { kind: "rgb", r: lit(255.7), g: lit(128.3), b: lit(64.9) };
    const result = RGB.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("rgb(255.7 128.3 64.9)");
    }
  });

  it("should return error for null color", () => {
    const result = RGB.generate(null as unknown as RGBColor);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.code).toBe("invalid-ir");
    }
  });

  it("should return error for missing fields", () => {
    const color = { kind: "rgb", r: lit(255) } as RGBColor;
    const result = RGB.generate(color);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.code).toBe("missing-required-field");
    }
  });

  it("should generate black", () => {
    const color: RGBColor = { kind: "rgb", r: lit(0), g: lit(0), b: lit(0) };
    const result = RGB.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("rgb(0 0 0)");
    }
  });

  it("should generate white", () => {
    const color: RGBColor = { kind: "rgb", r: lit(255), g: lit(255), b: lit(255) };
    const result = RGB.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("rgb(255 255 255)");
    }
  });
});
