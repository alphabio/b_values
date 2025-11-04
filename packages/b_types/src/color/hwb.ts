// b_path:: packages/b_types/src/color/hwb.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hwb
 */
export const hwbColorSchema = z.object({
  kind: z.literal("hwb"),
  h: z.number(),
  w: z.number().min(0).max(100),
  b: z.number().min(0).max(100),
  alpha: z.number().min(0).max(1).optional(),
});

export type HWBColor = z.infer<typeof hwbColorSchema>;
