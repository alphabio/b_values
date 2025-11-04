// b_path:: packages/b_types/src/color/hwb.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hwb
 */
export const hwbColorSchema = z.object({
  kind: z.literal("hwb"),
  h: z.number(),
  w: z.number(),
  b: z.number(),
  alpha: z.number().optional(),
});

export type HWBColor = z.infer<typeof hwbColorSchema>;
