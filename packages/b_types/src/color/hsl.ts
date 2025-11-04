// b_path:: packages/b_types/src/color/hsl.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsl
 */
export const hslColorSchema = z.object({
  kind: z.literal("hsl"),
  h: z.number(),
  s: z.number().min(0).max(100),
  l: z.number().min(0).max(100),
  alpha: z.number().min(0).max(1).optional(),
});

export type HSLColor = z.infer<typeof hslColorSchema>;
