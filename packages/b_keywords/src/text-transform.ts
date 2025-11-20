// b_path:: packages/b_keywords/src/text-transform.ts
import { z } from "zod";

/**
 * Text transform keywords
 * @see https://drafts.csswg.org/css-text/#text-transform-property
 */
export const textTransformKeywordSchema = z.union([
  z.literal("none"),
  z.literal("capitalize"),
  z.literal("uppercase"),
  z.literal("lowercase"),
  z.literal("full-width"),
  z.literal("full-size-kana"),
]);

export type TextTransformKeyword = z.infer<typeof textTransformKeywordSchema>;
