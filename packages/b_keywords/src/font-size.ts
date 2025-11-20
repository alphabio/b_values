// b_path:: packages/b_keywords/src/font-size.ts
import { z } from "zod";

/**
 * Absolute font size keywords
 * @see https://drafts.csswg.org/css-fonts-4/#absolute-size-value
 */
export const absoluteSizeSchema = z.union([
  z.literal("xx-small"),
  z.literal("x-small"),
  z.literal("small"),
  z.literal("medium"),
  z.literal("large"),
  z.literal("x-large"),
  z.literal("xx-large"),
  z.literal("xxx-large"),
]);

export type AbsoluteSize = z.infer<typeof absoluteSizeSchema>;

/**
 * Relative font size keywords
 * @see https://drafts.csswg.org/css-fonts-4/#relative-size-value
 */
export const relativeSizeSchema = z.union([z.literal("smaller"), z.literal("larger")]);

export type RelativeSize = z.infer<typeof relativeSizeSchema>;
