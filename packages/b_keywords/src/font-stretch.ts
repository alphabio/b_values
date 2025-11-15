// b_path:: packages/b_keywords/src/font-stretch.ts
import { z } from "zod";

/**
 * Font stretch keywords
 * @see https://drafts.csswg.org/css-fonts-4/#font-stretch-prop
 */
export const fontStretchKeywordSchema = z.union([
  z.literal("normal"),
  z.literal("ultra-condensed"),
  z.literal("extra-condensed"),
  z.literal("condensed"),
  z.literal("semi-condensed"),
  z.literal("semi-expanded"),
  z.literal("expanded"),
  z.literal("extra-expanded"),
  z.literal("ultra-expanded"),
]);

export type FontStretchKeyword = z.infer<typeof fontStretchKeywordSchema>;
