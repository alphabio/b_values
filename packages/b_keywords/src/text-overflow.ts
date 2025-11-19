// b_path:: packages/b_keywords/src/text-overflow.ts
import { z } from "zod";

/**
 * Text overflow keywords
 * @see https://drafts.csswg.org/css-overflow/#text-overflow
 */
export const textOverflowKeywordSchema = z.union([z.literal("clip"), z.literal("ellipsis")]);

export type TextOverflowKeyword = z.infer<typeof textOverflowKeywordSchema>;
