// b_path:: packages/b_types/src/color/oklab.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklab
 */
export const oklabColorSchema = z.object({
  kind: z.literal("oklab"),
  l: z.number(),
  a: z.number(),
  b: z.number(),
  alpha: z.number().optional(),
});

export type OKLabColor = z.infer<typeof oklabColorSchema>;
