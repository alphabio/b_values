// b_path:: packages/b_types/src/repeat-style.ts

import { z } from "zod";

/**
 * Represents a single <repetition> keyword.
 *
 * CSS Spec: <repetition> = repeat | space | round | no-repeat
 *
 * @see https://www.w3.org/TR/css-backgrounds-3/#typedef-repeat-style
 */
export const repetitionSchema = z.union([
  z.literal("repeat"),
  z.literal("space"),
  z.literal("round"),
  z.literal("no-repeat"),
]);

export type Repetition = z.infer<typeof repetitionSchema>;

/**
 * Represents a CSS <repeat-style> value.
 *
 * CSS Spec: <repeat-style> = repeat-x | repeat-y | [repeat | space | round | no-repeat]{1,2}
 *
 * Two forms:
 * - Shorthand: "repeat-x" or "repeat-y" (single keyword)
 * - Explicit: One or two <repetition> values (horizontal [vertical])
 *
 * When only one value is specified, it applies to both axes.
 *
 * @see https://www.w3.org/TR/css-backgrounds-3/#background-repeat
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-repeat
 */
export const repeatStyleSchema = z.discriminatedUnion("kind", [
  // Shorthand keywords: repeat-x, repeat-y
  z
    .object({
      kind: z.literal("shorthand"),
      value: z.union([z.literal("repeat-x"), z.literal("repeat-y")]),
    })
    .strict(),
  // Explicit: 1 or 2 repetition values
  z
    .object({
      kind: z.literal("explicit"),
      horizontal: repetitionSchema,
      vertical: repetitionSchema,
    })
    .strict(),
]);

export type RepeatStyle = z.infer<typeof repeatStyleSchema>;
