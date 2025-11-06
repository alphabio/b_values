// b_path:: packages/b_types/src/color-stop.ts
import { z } from "zod";
import { cssValueSchema } from "./values";
import { colorSchema } from "./color";

/**
 * Color hint (transition midpoint) between color stops.
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient#color-hints
 */
export const colorHintSchema = z
  .object({
    kind: z.literal("hint"),
    position: cssValueSchema, // length-percentage
  })
  .strict();

export type ColorHint = z.infer<typeof colorHintSchema>;

/**
 * Color stop in a gradient.
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient#color-stops
 */
export const colorStopSchema = z
  .object({
    kind: z.literal("stop").optional(), // Optional for backward compatibility
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

/**
 * Color stop or hint in a gradient.
 */
export const colorStopOrHintSchema = z.union([colorStopSchema, colorHintSchema]);

export type ColorStopOrHint = z.infer<typeof colorStopOrHintSchema>;

export const colorStopListSchema = z.array(colorStopOrHintSchema).min(2);

export type ColorStopList = z.infer<typeof colorStopListSchema>;
