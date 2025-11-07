// b_path:: packages/b_declarations/src/properties/background-clip/types.ts

import { z } from "zod";
import * as Keywords from "@b/keywords";

/**
 * Single background-clip value. This is the component type, <box>.
 * It's a keyword from our vocabulary.
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-clip
 */
const backgroundClipValueSchema = Keywords.backgroundClip;

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
