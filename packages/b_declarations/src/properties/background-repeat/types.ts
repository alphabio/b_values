// b_path:: packages/b_declarations/src/properties/background-repeat/types.ts

import { z } from "zod";
import { repeatStyleSchema, cssValueSchema } from "@b/types";
import * as Keywords from "@b/keywords";

/**
 * Concrete background-repeat values per CSS spec.
 */
const backgroundRepeatSchema = repeatStyleSchema;

/**
 * background-repeat value with universal CSS function support.
 * Can be a concrete repeat-style OR a CssValue (var(), calc(), etc.)
 */
const backgroundRepeatValueSchema = z.union([backgroundRepeatSchema, cssValueSchema]);

export type RepeatStyleValue = z.infer<typeof backgroundRepeatValueSchema>;

/**
 * The final IR schema for the entire `background-repeat` property.
 */
export const backgroundRepeatIRSchema = z.discriminatedUnion("kind", [
  // OPTION A: The entire property is a CSS-wide keyword.
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.cssWide,
  }),

  // OPTION B: The entire property is a list of <repeat-style> values.
  z.object({
    kind: z.literal("list"),
    values: z.array(backgroundRepeatValueSchema).min(1),
  }),
]);

/**
 * Authoritative type for the `background-repeat` property's IR,
 * inferred directly from the schema.
 */
export type BackgroundRepeatIR = z.infer<typeof backgroundRepeatIRSchema>;
