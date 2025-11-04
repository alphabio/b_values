// b_path:: packages/b_types/src/color/hsl.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsl
 */
export const hslColorSchema = z.object({
  kind: z.literal("hsl"),
  h: z.number(),
  s: z.number(),
  l: z.number(),
  alpha: z.number().optional(),
});

export type HSLColor = z.infer<typeof hslColorSchema>;
