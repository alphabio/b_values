// b_path:: packages/b_types/src/color/oklab.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklab
 */
export const oklabColorSchema = z.object({
  kind: z.literal("oklab"),
  l: z.number().min(0).max(1),
  a: z.number().min(-0.4).max(0.4),
  b: z.number().min(-0.4).max(0.4),
  alpha: z.number().min(0).max(1).optional(),
});

export type OKLabColor = z.infer<typeof oklabColorSchema>;
