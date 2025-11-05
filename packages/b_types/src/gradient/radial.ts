// b_path:: packages/b_types/src/gradient/radial.ts
import { z } from "zod";
import { radialShapeSchema } from "@b/keywords";
import { colorStopListSchema } from "../color-stop";
import { colorInterpolationMethodSchema } from "../color-interpolation-method";
import { position2DSchema } from "../position";
import { radialGradientSizeSchema } from "./radial-size";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/radial-gradient
 */
export const radialGradientSchema = z
  .object({
    kind: z.literal("radial"),
    shape: radialShapeSchema.optional(),
    size: radialGradientSizeSchema.optional(),
    position: position2DSchema.optional(),
    colorInterpolationMethod: colorInterpolationMethodSchema.optional(),
    colorStops: colorStopListSchema,
    repeating: z.boolean(),
  })
  .strict();

export type RadialGradient = z.infer<typeof radialGradientSchema>;
