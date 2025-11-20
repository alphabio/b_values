// b_path:: packages/b_keywords/src/font-style.ts
import { z } from "zod";

/**
 * Font style keywords
 * @see https://drafts.csswg.org/css-fonts-4/#font-style-prop
 */
export const fontStyleKeywordSchema = z.union([z.literal("normal"), z.literal("italic"), z.literal("oblique")]);

export type FontStyleKeyword = z.infer<typeof fontStyleKeywordSchema>;
