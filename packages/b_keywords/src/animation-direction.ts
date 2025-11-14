// b_path:: packages/b_keywords/src/animation-direction.ts

import { z } from "zod";

/**
 * Animation direction keywords
 * @see https://drafts.csswg.org/css-animations-1/#propdef-animation-direction
 */
export const animationDirectionKeywordSchema = z.union([
  z.literal("normal"),
  z.literal("reverse"),
  z.literal("alternate"),
  z.literal("alternate-reverse"),
]);

export type AnimationDirectionKeyword = z.infer<typeof animationDirectionKeywordSchema>;
