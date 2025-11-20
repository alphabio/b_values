// b_path:: packages/b_keywords/src/font-weight.ts
import { z } from "zod";

/**
 * Font weight keywords
 * @see https://drafts.csswg.org/css-fonts-4/#font-weight-prop
 */
export const fontWeightKeywordSchema = z.union([
  z.literal("normal"),
  z.literal("bold"),
  z.literal("bolder"),
  z.literal("lighter"),
]);

export type FontWeightKeyword = z.infer<typeof fontWeightKeywordSchema>;
