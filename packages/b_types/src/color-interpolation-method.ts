// b_path:: packages/b_types/src/color-interpolation-method.ts
import { z } from "zod";
import { hueInterpolationMethodSchema, polarColorSpaceSchema, rectangularColorSpaceSchema } from "@b/keywords";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color-interpolation-method
 */
export const colorInterpolationMethodSchema = z.union([
  z
    .object({
      colorSpace: rectangularColorSpaceSchema,
    })
    .strict(),
  z
    .object({
      colorSpace: polarColorSpaceSchema,
      hueInterpolationMethod: hueInterpolationMethodSchema.optional(),
    })
    .strict(),
]);

export type ColorInterpolationMethod = z.infer<typeof colorInterpolationMethodSchema>;
