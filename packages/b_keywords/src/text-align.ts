// b_path:: packages/b_keywords/src/text-align.ts
import { z } from "zod";

/**
 * Text alignment keywords
 * @see https://drafts.csswg.org/css-text/#text-align-property
 */
export const textAlignKeywordSchema = z.union([
  z.literal("start"),
  z.literal("end"),
  z.literal("left"),
  z.literal("right"),
  z.literal("center"),
  z.literal("justify"),
  z.literal("match-parent"),
]);

export type TextAlignKeyword = z.infer<typeof textAlignKeywordSchema>;
