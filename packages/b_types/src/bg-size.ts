// b_path:: packages/b_types/src/bg-size.ts

import { z } from "zod";
import { cssValueSchema } from "./values/css-value";
import { cssWideKeywordSchema, bgSizeKeywordSchema } from "@b/keywords";

/**
 * Represents a single background size value (one item in the comma-separated list).
 * This corresponds to the `<bg-size>` type in the CSS spec.
 *
 * Syntax: [ <length-percentage [0,∞]> | auto ]{1,2} | cover | contain
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-size
 */
export const bgSizeSchema = z.discriminatedUnion("kind", [
  // Handles 'cover' and 'contain'
  z.object({
    kind: z.literal("keyword"),
    value: bgSizeKeywordSchema,
  }),
  // Handles 1-value syntax ('auto', '50%') and 2-value syntax ('50% auto')
  z.object({
    kind: z.literal("explicit"),
    // The width and height are just CssValues! This allows for literals,
    // keywords ('auto'), var(), and calc() all for free.
    width: cssValueSchema,
    height: cssValueSchema,
  }),
]);

export type BgSize = z.infer<typeof bgSizeSchema>;

/**
 * The final IR for the entire `background-size` property.
 * Supports CSS-wide keywords or a list of <bg-size> values.
 */
export const bgSizeListSchema = z.discriminatedUnion("kind", [
  // For global keywords like 'inherit', 'unset', etc.
  z.object({
    kind: z.literal("keyword"),
    value: cssWideKeywordSchema,
  }),
  // For one or more <bg-size> values
  z.object({
    kind: z.literal("list"),
    values: z.array(bgSizeSchema).min(1),
  }),
]);

export type BgSizeList = z.infer<typeof bgSizeListSchema>;
