// b_path:: packages/b_keywords/src/color-space.ts
import { z } from "zod";

/**
 * Color spaces supported by the color() function
 * @see https://www.w3.org/TR/css-color-4/#color-function
 */
export const colorFunctionSpaceSchema = z.union([
  z.literal("srgb"),
  z.literal("srgb-linear"),
  z.literal("display-p3"),
  z.literal("a98-rgb"),
  z.literal("prophoto-rgb"),
  z.literal("rec2020"),
  z.literal("xyz"),
  z.literal("xyz-d50"),
  z.literal("xyz-d65"),
]);

export type ColorFunctionSpace = z.infer<typeof colorFunctionSpaceSchema>;
