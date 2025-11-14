// b_path:: packages/b_keywords/src/animation-fill-mode.ts

import { z } from "zod";

/**
 * Animation fill mode keywords
 * @see https://drafts.csswg.org/css-animations-1/#propdef-animation-fill-mode
 */
export const animationFillModeKeywordSchema = z.union([
  z.literal("none"),
  z.literal("forwards"),
  z.literal("backwards"),
  z.literal("both"),
]);

export type AnimationFillModeKeyword = z.infer<typeof animationFillModeKeywordSchema>;
