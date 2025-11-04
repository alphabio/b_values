// b_path:: packages/b_types/src/color/lch.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/lch
 */
export const lchColorSchema = z.object({
  kind: z.literal("lch"),
  l: z.number().min(0).max(100),
  c: z.number().min(0).max(150),
  h: z.number(),
  alpha: z.number().min(0).max(1).optional(),
});

export type LCHColor = z.infer<typeof lchColorSchema>;
