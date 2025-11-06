// b_path:: packages/b_types/src/color-stop.ts
import { z } from "zod";
import { cssValueSchema } from "./values";
import { colorSchema } from "./color";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient#color-stops
 */
export const colorStopSchema = z
  .object({
    color: colorSchema,
    position: z
      .union([
        cssValueSchema, // Single position (length/percentage/angle or var/calc)
        z.tuple([cssValueSchema, cssValueSchema]), // Two positions
      ])
      .optional(),
  })
  .strict();

export type ColorStop = z.infer<typeof colorStopSchema>;

export const colorStopListSchema = z.array(colorStopSchema).min(2);

export type ColorStopList = z.infer<typeof colorStopListSchema>;
