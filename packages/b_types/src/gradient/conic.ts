import { z } from "zod";
import { colorInterpolationSchema } from "@b/keywords";
import { angleSchema } from "../angle";
import { colorStopListSchema } from "../color-stop";
import { position2DSchema } from "../position";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/conic-gradient
 */
export const conicGradientSchema = z.object({
  kind: z.literal("conic"),
  fromAngle: angleSchema.optional(),
  position: position2DSchema.optional(),
  colorSpace: colorInterpolationSchema.optional(),
  colorStops: colorStopListSchema,
  repeating: z.boolean(),
});

export type ConicGradient = z.infer<typeof conicGradientSchema>;
