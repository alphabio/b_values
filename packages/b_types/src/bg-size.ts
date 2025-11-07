// b_path:: packages/b_types/src/bg-size.ts

import { z } from "zod";
import { cssValueSchema } from "./values/css-value";
import * as Keywords from "@b/keywords";

/**
 * Represents a single <bg-size> component value.
 * Used by background-size and mask-size.
 * Syntax: [ <length-percentage> | auto ]{1,2} | cover | contain
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-size
 */
export const bgSizeSchema = z.discriminatedUnion("kind", [
  // Handles 'cover' and 'contain'
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.bgSize,
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
