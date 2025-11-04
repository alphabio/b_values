// b_path:: packages/b_generators/src/color/rgb.test.ts
import { describe, expect, it } from "vitest";
import type { RGBColor } from "@b/types";
import * as RGB from "./rgb";

describe("rgb generator", () => {
  it("should generate opaque RGB color", () => {
    const color: RGBColor = { kind: "rgb", r: 255, g: 0, b: 0 };
    const result = RGB.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("rgb(255 0 0)");
    }
  });

  it("should generate RGB color with alpha", () => {
    const color: RGBColor = { kind: "rgb", r: 255, g: 0, b: 0, alpha: 0.5 };
    const result = RGB.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("rgb(255 0 0 / 0.5)");
    }
  });

  it("should omit alpha when fully opaque", () => {
    const color: RGBColor = { kind: "rgb", r: 255, g: 0, b: 0, alpha: 1 };
    const result = RGB.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("rgb(255 0 0)");
    }
  });

  it("should round RGB values to integers", () => {
    const color: RGBColor = { kind: "rgb", r: 255.7, g: 128.3, b: 64.9 };
    const result = RGB.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("rgb(256 128 65)");
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
    const color = { kind: "rgb", r: 255 } as RGBColor;
    const result = RGB.generate(color);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.code).toBe("missing-required-field");
    }
  });

  it("should generate black", () => {
    const color: RGBColor = { kind: "rgb", r: 0, g: 0, b: 0 };
    const result = RGB.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("rgb(0 0 0)");
    }
  });

  it("should generate white", () => {
    const color: RGBColor = { kind: "rgb", r: 255, g: 255, b: 255 };
    const result = RGB.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("rgb(255 255 255)");
    }
  });
});
