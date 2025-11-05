// b_path:: packages/b_types/src/color/special.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#special_values
 */
export const specialColorSchema = z
  .object({
    kind: z.literal("special"),
    keyword: z.enum(["transparent", "currentcolor"]),
  })
  .strict();

export type SpecialColor = z.infer<typeof specialColorSchema>;
