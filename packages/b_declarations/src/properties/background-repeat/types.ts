// b_path:: packages/b_declarations/src/properties/background-repeat/types.ts

import { z } from "zod";
import { repeatStyleSchema, cssValueSchema } from "@b/types";
import * as Keywords from "@b/keywords";

// Union of structured repeat-style OR generic CssValue (for var(), calc(), etc.)
const repeatStyleOrCssValueSchema = z.union([repeatStyleSchema, cssValueSchema]);

export type RepeatStyleValue = z.infer<typeof repeatStyleOrCssValueSchema>;

/**
 * The final IR schema for the entire `background-repeat` property.
 */
export const backgroundRepeatIRSchema = z.discriminatedUnion("kind", [
  // OPTION A: The entire property is a CSS-wide keyword.
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.cssWide,
  }),

  // OPTION B: The entire property is a list of <repeat-style> values OR CssValues.
  z.object({
    kind: z.literal("list"),
    values: z.array(repeatStyleOrCssValueSchema).min(1),
  }),
]);

/**
 * Authoritative type for the `background-repeat` property's IR,
 * inferred directly from the schema.
 */
export type BackgroundRepeatIR = z.infer<typeof backgroundRepeatIRSchema>;
