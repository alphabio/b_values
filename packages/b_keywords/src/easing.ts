// b_path:: packages/b_keywords/src/easing.ts

import { z } from "zod";

/**
 * Easing function keywords
 * @see https://drafts.csswg.org/css-easing-1/#typedef-easing-function
 */
export const easingKeywordSchema = z.union([
  z.literal("linear"),
  z.literal("ease"),
  z.literal("ease-in"),
  z.literal("ease-out"),
  z.literal("ease-in-out"),
  z.literal("step-start"),
  z.literal("step-end"),
]);

export type EasingKeyword = z.infer<typeof easingKeywordSchema>;

/**
 * Steps position keywords
 * @see https://drafts.csswg.org/css-easing-1/#step-position
 */
export const stepsPositionSchema = z.union([
  z.literal("jump-start"),
  z.literal("jump-end"),
  z.literal("jump-none"),
  z.literal("jump-both"),
  z.literal("start"),
  z.literal("end"),
]);

export type StepsPosition = z.infer<typeof stepsPositionSchema>;
