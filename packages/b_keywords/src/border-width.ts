// b_path:: packages/b_keywords/src/border-width.ts

import { z } from "zod";

/**
 * Line width keywords
 * @see https://drafts.csswg.org/css-backgrounds-3/#typedef-line-width
 */
export const lineWidthKeywordSchema = z.union([z.literal("thin"), z.literal("medium"), z.literal("thick")]);

export type LineWidthKeyword = z.infer<typeof lineWidthKeywordSchema>;
