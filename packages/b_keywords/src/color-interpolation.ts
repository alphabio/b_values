// b_path:: packages/b_keywords/src/color-interpolation.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color-interpolation-method
 */
export const colorInterpolationSchema = z.union([
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
  z.literal("hsl"),
  z.literal("hwb"),
  z.literal("lch"),
  z.literal("oklch"),
  z.literal("shorter"),
  z.literal("longer"),
  z.literal("increasing"),
  z.literal("decreasing"),
]);

export type ColorInterpolation = z.infer<typeof colorInterpolationSchema>;
