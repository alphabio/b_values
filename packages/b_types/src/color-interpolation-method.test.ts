import { describe, expect, it } from "vitest";
import { colorInterpolationMethodSchema } from "./color-interpolation-method";

describe("colorInterpolationMethodSchema", () => {
  it("validates rectangular color space", () => {
    const result = colorInterpolationMethodSchema.parse({
      colorSpace: "srgb",
    });
    expect(result).toEqual({ colorSpace: "srgb" });
  });

  it("validates polar color space without hue method", () => {
    const result = colorInterpolationMethodSchema.parse({
      colorSpace: "oklch",
    });
    expect(result).toEqual({ colorSpace: "oklch" });
  });

  it("validates polar color space with hue method", () => {
    const result = colorInterpolationMethodSchema.parse({
      colorSpace: "oklch",
      hueInterpolationMethod: "shorter hue",
    });
    expect(result).toEqual({
      colorSpace: "oklch",
      hueInterpolationMethod: "shorter hue",
    });
  });

  it("validates all hue interpolation methods", () => {
    expect(
      colorInterpolationMethodSchema.parse({
        colorSpace: "hsl",
        hueInterpolationMethod: "shorter hue",
      }),
    ).toEqual({ colorSpace: "hsl", hueInterpolationMethod: "shorter hue" });

    expect(
      colorInterpolationMethodSchema.parse({
        colorSpace: "lch",
        hueInterpolationMethod: "longer hue",
      }),
    ).toEqual({ colorSpace: "lch", hueInterpolationMethod: "longer hue" });

    expect(
      colorInterpolationMethodSchema.parse({
        colorSpace: "oklch",
        hueInterpolationMethod: "increasing hue",
      }),
    ).toEqual({ colorSpace: "oklch", hueInterpolationMethod: "increasing hue" });

    expect(
      colorInterpolationMethodSchema.parse({
        colorSpace: "hwb",
        hueInterpolationMethod: "decreasing hue",
      }),
    ).toEqual({ colorSpace: "hwb", hueInterpolationMethod: "decreasing hue" });
  });
});
