import { z } from "zod";
import { radialSizeKeywordSchema } from "@b/keywords";
import { lengthPercentageSchema } from "../length-percentage";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/radial-gradient
 */
export const radialGradientSizeSchema = z.union([
  z.object({
    kind: z.literal("keyword"),
    value: radialSizeKeywordSchema,
  }),
  z.object({
    kind: z.literal("circle-explicit"),
    radius: lengthPercentageSchema,
  }),
  z.object({
    kind: z.literal("ellipse-explicit"),
    radiusX: lengthPercentageSchema,
    radiusY: lengthPercentageSchema,
  }),
]);

export type RadialGradientSize = z.infer<typeof radialGradientSizeSchema>;
