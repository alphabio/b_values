// b_path:: packages/b_keywords/src/transform-style.ts

import { z } from "zod";

/**
 * Transform style keywords
 * @see https://drafts.csswg.org/css-transforms-2/#transform-style-property
 */
export const transformStyleKeywordSchema = z.union([z.literal("flat"), z.literal("preserve-3d")]);

export type TransformStyleKeyword = z.infer<typeof transformStyleKeywordSchema>;
