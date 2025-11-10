// b_path:: packages/b_declarations/src/properties/background-clip/types.ts

import { z } from "zod";
import * as Keywords from "@b/keywords";
import { cssValueSchema } from "@b/types";

/**
 * Concrete background-clip values per CSS spec.
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-clip
 */
const backgroundClipSchema = Keywords.backgroundClip;

/**
 * background-clip value with universal CSS function support.
 * Can be a concrete keyword OR a CssValue (var(), calc(), etc.)
 */
const backgroundClipValueSchema = z.union([backgroundClipSchema, cssValueSchema]);

/**
 * The final IR schema for the entire `background-clip` property.
 * This is the top-level property type.
 */
export const backgroundClipIRSchema = z.discriminatedUnion("kind", [
  // OPTION A: The entire property is a CSS-wide keyword.
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.cssWide,
  }),

  // OPTION B: The entire property is a list of <box> values.
  z.object({
    kind: z.literal("list"),
    values: z.array(backgroundClipValueSchema).min(1),
  }),
]);

/**
 * Authoritative type for the `background-clip` property's IR,
 * inferred directly from the schema.
 */
export type BackgroundClipIR = z.infer<typeof backgroundClipIRSchema>;
