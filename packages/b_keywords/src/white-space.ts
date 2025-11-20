// b_path:: packages/b_keywords/src/white-space.ts
import { z } from "zod";

/**
 * White space handling keywords
 * @see https://drafts.csswg.org/css-text/#white-space-property
 */
export const whiteSpaceKeywordSchema = z.union([
  z.literal("normal"),
  z.literal("pre"),
  z.literal("nowrap"),
  z.literal("pre-wrap"),
  z.literal("pre-line"),
  z.literal("break-spaces"),
]);

export type WhiteSpaceKeyword = z.infer<typeof whiteSpaceKeywordSchema>;
