// b_path:: packages/b_types/src/color-interpolation-method.ts
import { z } from "zod";
import * as Keywords from "@b/keywords";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color-interpolation-method
 */
export const colorInterpolationMethodSchema = z.union([
  z
    .object({
      colorSpace: Keywords.rectangularColorSpace,
    })
    .strict(),
  z
    .object({
      colorSpace: Keywords.polarColorSpace,
      hueInterpolationMethod: Keywords.hueInterpolationMethod.optional(),
    })
    .strict(),
]);

export type ColorInterpolationMethod = z.infer<typeof colorInterpolationMethodSchema>;
