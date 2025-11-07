// b_path:: packages/b_declarations/src/properties/background-origin/types.ts

import { z } from "zod";
import * as Keywords from "@b/keywords";

/**
 * Single background-origin value. Sets the background's origin: from the border start,
 * inside the border, or inside the padding.
 * It's a keyword from our vocabulary.
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-origin
 */
const backgroundOriginValue = Keywords.backgroundOrigin;

/**
 * The final IR schema for the entire `background-origin` property.
 * This is the top-level property type.
 */
export const backgroundOriginIR = z.discriminatedUnion("kind", [
  // OPTION A: The entire property is a CSS-wide keyword.
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.cssWide,
  }),

  // OPTION B: The entire property is a list of <background-origin> values.
  z.object({
    kind: z.literal("list"),
    values: z.array(backgroundOriginValue).min(1),
  }),
]);

export type BackgroundOriginIR = z.infer<typeof backgroundOriginIR>;
