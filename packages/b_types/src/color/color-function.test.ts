// b_path:: packages/b_types/src/color/color-function.test.ts
import { describe, expect, it } from "vitest";
import { colorFunctionSchema } from "./color-function";

describe("colorFunctionSchema", () => {
  it("validates srgb color space", () => {
    const result = colorFunctionSchema.safeParse({
      kind: "color",
      colorSpace: "srgb",
      channels: [0.5, 0.2, 0.8],
    });
    expect(result.success).toBe(true);
  });

  it("validates display-p3 color space", () => {
    const result = colorFunctionSchema.safeParse({
      kind: "color",
      colorSpace: "display-p3",
      channels: [0.928, 0.322, 0.203],
    });
    expect(result.success).toBe(true);
  });

  it("validates with alpha channel", () => {
    const result = colorFunctionSchema.safeParse({
      kind: "color",
      colorSpace: "display-p3",
      channels: [0.928, 0.322, 0.203],
      alpha: 0.8,
    });
    expect(result.success).toBe(true);
  });

  it("validates all color spaces", () => {
    const colorSpaces = [
      "srgb",
      "srgb-linear",
      "display-p3",
      "a98-rgb",
      "prophoto-rgb",
      "rec2020",
      "xyz",
      "xyz-d50",
      "xyz-d65",
    ];

    for (const colorSpace of colorSpaces) {
      const result = colorFunctionSchema.safeParse({
        kind: "color",
        colorSpace,
        channels: [0.5, 0.5, 0.5],
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid color space", () => {
    const result = colorFunctionSchema.safeParse({
      kind: "color",
      colorSpace: "invalid-space",
      channels: [0.5, 0.2, 0.8],
    });
    expect(result.success).toBe(false);
  });

  it("rejects channels with wrong length", () => {
    const result = colorFunctionSchema.safeParse({
      kind: "color",
      colorSpace: "srgb",
      channels: [0.5, 0.2],
    });
    expect(result.success).toBe(false);
  });

  it("rejects wrong kind", () => {
    const result = colorFunctionSchema.safeParse({
      kind: "rgb",
      colorSpace: "srgb",
      channels: [0.5, 0.2, 0.8],
    });
    expect(result.success).toBe(false);
  });
});
