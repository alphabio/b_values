// b_path:: packages/b_types/src/gradient/linear.ts
import { z } from "zod";
import { colorStopListSchema } from "../color-stop";
import { colorInterpolationMethodSchema } from "../color-interpolation-method";
import { gradientDirectionSchema } from "./direction";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient
 */
export const linearGradientSchema = z.object({
  kind: z.literal("linear"),
  direction: gradientDirectionSchema.optional(),
  colorInterpolationMethod: colorInterpolationMethodSchema.optional(),
  colorStops: colorStopListSchema,
  repeating: z.boolean(),
});

export type LinearGradient = z.infer<typeof linearGradientSchema>;
