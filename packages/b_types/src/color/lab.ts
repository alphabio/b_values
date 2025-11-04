// b_path:: packages/b_types/src/color/lab.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/lab
 */
export const labColorSchema = z.object({
  kind: z.literal("lab"),
  l: z.number(),
  a: z.number(),
  b: z.number(),
  alpha: z.number().optional(),
});

export type LABColor = z.infer<typeof labColorSchema>;
