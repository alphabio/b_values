// b_path:: packages/b_types/src/gradient/conic.ts
import { z } from "zod";
import { cssValueSchema } from "../values";
import { colorStopListSchema } from "../color-stop";
import { colorInterpolationMethodSchema } from "../color-interpolation-method";
import { position2DSchema } from "../position";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/conic-gradient
 */
export const conicGradientSchema = z
  .object({
    kind: z.literal("conic"),
    fromAngle: cssValueSchema.optional(), // Changed from angleSchema to support var/calc
    position: position2DSchema.optional(),
    colorInterpolationMethod: colorInterpolationMethodSchema.optional(),
    colorStops: colorStopListSchema,
    repeating: z.boolean(),
  })
  .strict();

export type ConicGradient = z.infer<typeof conicGradientSchema>;
