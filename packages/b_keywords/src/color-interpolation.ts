// b_path:: packages/b_keywords/src/color-interpolation.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color-interpolation-method
 */

export const rectangularColorSpace = z.union([
  z.literal("srgb"),
  z.literal("srgb-linear"),
  z.literal("display-p3"),
  z.literal("display-p3-linear"),
  z.literal("a98-rgb"),
  z.literal("prophoto-rgb"),
  z.literal("rec2020"),
  z.literal("lab"),
  z.literal("oklab"),
  z.literal("xyz"),
  z.literal("xyz-d50"),
  z.literal("xyz-d65"),
]);

export type RectangularColorSpace = z.infer<typeof rectangularColorSpace>;

export const polarColorSpace = z.union([z.literal("hsl"), z.literal("hwb"), z.literal("lch"), z.literal("oklch")]);

export type PolarColorSpace = z.infer<typeof polarColorSpace>;

export const hueInterpolationMethod = z.union([
  z.literal("shorter hue"),
  z.literal("longer hue"),
  z.literal("increasing hue"),
  z.literal("decreasing hue"),
]);

export type HueInterpolationMethod = z.infer<typeof hueInterpolationMethod>;

// For backward compatibility, keep the simple union
export const colorInterpolation = z.union([rectangularColorSpace, polarColorSpace]);

export type ColorInterpolation = z.infer<typeof colorInterpolation>;
