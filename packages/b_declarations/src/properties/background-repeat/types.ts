// b_path:: packages/b_declarations/src/properties/background-repeat/types.ts

import { z } from "zod";
import { repeatStyleSchema } from "@b/types"; // <-- Import the component SCHEMA
import * as Keywords from "@b/keywords";

// The component schema is imported directly. We can infer the component type if needed.
export type RepeatStyleValue = z.infer<typeof repeatStyleSchema>;

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
    values: z.array(repeatStyleSchema).min(1),
  }),
]);

/**
 * Authoritative type for the `background-repeat` property's IR,
 * inferred directly from the schema.
 */
export type BackgroundRepeatIR = z.infer<typeof backgroundRepeatIRSchema>;
