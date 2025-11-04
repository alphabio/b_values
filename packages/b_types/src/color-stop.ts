import { z } from "zod";
import { angleSchema } from "./angle";
import { colorSchema } from "./color";
import { lengthPercentageSchema } from "./length-percentage";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient#color-stops
 */
export const colorStopSchema = z.object({
  color: colorSchema,
  position: z.union([lengthPercentageSchema, angleSchema]).optional(),
});

export type ColorStop = z.infer<typeof colorStopSchema>;

export const colorStopListSchema = z.array(colorStopSchema).min(2);

export type ColorStopList = z.infer<typeof colorStopListSchema>;
