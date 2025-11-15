// b_path:: packages/b_keywords/src/font-variant.ts
import { z } from "zod";

/**
 * Font variant keywords (CSS2.1 legacy)
 * @see https://drafts.csswg.org/css-fonts-4/#font-variant-css21-values
 */
export const fontVariantKeywordSchema = z.union([z.literal("normal"), z.literal("small-caps")]);

export type FontVariantKeyword = z.infer<typeof fontVariantKeywordSchema>;
