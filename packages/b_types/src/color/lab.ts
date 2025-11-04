// b_path:: packages/b_types/src/color/lab.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/lab
 */
export const labColorSchema = z.object({
  kind: z.literal("lab"),
  l: z.number().min(0).max(100),
  a: z.number().min(-125).max(125),
  b: z.number().min(-125).max(125),
  alpha: z.number().min(0).max(1).optional(),
});

export type LABColor = z.infer<typeof labColorSchema>;
