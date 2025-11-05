// b_path:: packages/b_types/src/gradient/radial-size.ts
import { z } from "zod";
import { radialSizeKeywordSchema } from "@b/keywords";
import { lengthPercentageSchema } from "../length-percentage";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/radial-gradient
 */
export const radialGradientSizeSchema = z.union([
  z
    .object({
      kind: z.literal("keyword"),
      value: radialSizeKeywordSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("circle-explicit"),
      radius: lengthPercentageSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("ellipse-explicit"),
      radiusX: lengthPercentageSchema,
      radiusY: lengthPercentageSchema,
    })
    .strict(),
]);

export type RadialGradientSize = z.infer<typeof radialGradientSizeSchema>;
