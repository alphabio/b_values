// b_path:: packages/b_types/src/color-stop.ts
import { z } from "zod";
import { angleSchema } from "./angle";
import { colorSchema } from "./color";
import { lengthPercentageSchema } from "./length-percentage";
import { percentageSchema } from "./percentage";

/**
 * Angle or percentage value (used in conic gradients)
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/conic-gradient
 */
export const anglePercentageSchema = z.union([angleSchema, percentageSchema]);

export type AnglePercentage = z.infer<typeof anglePercentageSchema>;

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient#color-stops
 */
export const colorStopSchema = z
  .object({
    color: colorSchema,
    position: z
      .union([
        z.union([lengthPercentageSchema, angleSchema]),
        z.tuple([z.union([lengthPercentageSchema, angleSchema]), z.union([lengthPercentageSchema, angleSchema])]),
      ])
      .optional(),
  })
  .strict();

export type ColorStop = z.infer<typeof colorStopSchema>;

/**
 * Angular color hint - position hint between color stops in conic gradients
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/conic-gradient
 */
export const angularColorHintSchema = anglePercentageSchema;

export type AngularColorHint = z.infer<typeof angularColorHintSchema>;

export const colorStopListSchema = z.array(colorStopSchema).min(2);

export type ColorStopList = z.infer<typeof colorStopListSchema>;
