// b_path:: packages/b_keywords/src/animation-play-state.ts

import { z } from "zod";

/**
 * Animation play state keywords
 * @see https://drafts.csswg.org/css-animations-1/#propdef-animation-play-state
 */
export const animationPlayStateKeywordSchema = z.union([z.literal("running"), z.literal("paused")]);

export type AnimationPlayStateKeyword = z.infer<typeof animationPlayStateKeywordSchema>;
