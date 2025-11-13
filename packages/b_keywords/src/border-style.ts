// b_path:: packages/b_keywords/src/border-style.ts

import { z } from "zod";

/**
 * Border style keywords
 * @see https://drafts.csswg.org/css-backgrounds-3/#propdef-border-style
 */
export const borderStyleKeywordSchema = z.union([
  z.literal("none"),
  z.literal("hidden"),
  z.literal("dotted"),
  z.literal("dashed"),
  z.literal("solid"),
  z.literal("double"),
  z.literal("groove"),
  z.literal("ridge"),
  z.literal("inset"),
  z.literal("outset"),
]);

export type BorderStyleKeyword = z.infer<typeof borderStyleKeywordSchema>;
