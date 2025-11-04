// b_path:: packages/b_types/src/color/rgb.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/rgb
 */
export const rgbColorSchema = z.object({
  kind: z.literal("rgb"),
  r: z.number(),
  g: z.number(),
  b: z.number(),
  alpha: z.number().optional(),
});

export type RGBColor = z.infer<typeof rgbColorSchema>;
