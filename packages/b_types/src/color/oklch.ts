// b_path:: packages/b_types/src/color/oklch.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch
 */
export const oklchColorSchema = z.object({
  kind: z.literal("oklch"),
  l: z.number(),
  c: z.number(),
  h: z.number(),
  alpha: z.number().optional(),
});

export type OKLCHColor = z.infer<typeof oklchColorSchema>;
