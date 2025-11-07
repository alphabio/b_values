import { z } from "zod";

/**
 * Defines CSS-wide keywords that apply to all properties.
 * @see https://www.w3.org/TR/css-values-4/#common-keywords
 */
export const cssWideKeywordSchema = z.union([
  z.literal("inherit"),
  z.literal("initial"),
  z.literal("unset"),
  z.literal("revert"),
  z.literal("revert-layer"),
]);

export type CssWideKeyword = z.infer<typeof cssWideKeywordSchema>;
