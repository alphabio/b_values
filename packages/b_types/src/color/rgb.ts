// b_path:: packages/b_types/src/color/rgb.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/rgb
 */
export const rgbColorSchema = z.object({
  kind: z.literal("rgb"),
  r: z.number().min(0).max(255),
  g: z.number().min(0).max(255),
  b: z.number().min(0).max(255),
  alpha: z.number().min(0).max(1).optional(),
});

export type RGBColor = z.infer<typeof rgbColorSchema>;
