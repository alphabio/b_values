// b_path:: packages/b_types/src/color/oklch.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch
 */
export const oklchColorSchema = z.object({
  kind: z.literal("oklch"),
  l: z.number().min(0).max(1),
  c: z.number().min(0).max(0.4),
  h: z.number(),
  alpha: z.number().min(0).max(1).optional(),
});

export type OKLCHColor = z.infer<typeof oklchColorSchema>;
