// b_path:: packages/b_declarations/src/properties/background-origin/types.ts

import { z } from "zod";
import * as Keywords from "@b/keywords";
import { cssValueSchema } from "@b/types";

/**
 * Concrete background-origin values per CSS spec.
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-origin
 */
const backgroundOriginSchema = Keywords.backgroundOrigin;

/**
 * background-origin value with universal CSS function support.
 * Can be a concrete keyword OR a CssValue (var(), calc(), etc.)
 */
const backgroundOriginValueSchema = z.union([backgroundOriginSchema, cssValueSchema]);

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
    values: z.array(backgroundOriginValueSchema).min(1),
  }),
]);

export type BackgroundOriginIR = z.infer<typeof backgroundOriginIR>;
