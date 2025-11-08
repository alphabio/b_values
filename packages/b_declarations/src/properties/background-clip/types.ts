// b_path:: packages/b_declarations/src/properties/background-clip/types.ts

import { z } from "zod";
import * as Keywords from "@b/keywords";
import { cssValueSchema } from "@b/types";

/**
 * Single background-clip value. This is the component type, <box>.
 * Accepts specific keywords (border-box, padding-box, content-box, text)
 * OR any CssValue (var(), calc(), etc.)
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-clip
 */
const backgroundClipValueSchema = cssValueSchema;

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
