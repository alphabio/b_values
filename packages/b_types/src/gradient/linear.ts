import { z } from "zod";
import { colorInterpolationSchema } from "@b/keywords";
import { colorStopListSchema } from "../color-stop";
import { gradientDirectionSchema } from "./direction";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient
 */
export const linearGradientSchema = z.object({
  kind: z.literal("linear"),
  direction: gradientDirectionSchema.optional(),
  colorSpace: colorInterpolationSchema.optional(),
  colorStops: colorStopListSchema,
  repeating: z.boolean(),
});

export type LinearGradient = z.infer<typeof linearGradientSchema>;
