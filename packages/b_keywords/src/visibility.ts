// b_path:: packages/b_keywords/src/visibility.ts

import { z } from "zod";

/**
 * Visibility keywords
 * @see https://drafts.csswg.org/css-display/#visibility
 */
export const visibilityKeywordSchema = z.union([z.literal("visible"), z.literal("hidden"), z.literal("collapse")]);

export type VisibilityKeyword = z.infer<typeof visibilityKeywordSchema>;
