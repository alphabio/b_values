// b_path:: packages/b_declarations/src/properties/background-size/types.ts
import { z } from "zod";
import { bgSizeSchema, cssValueSchema } from "@b/types";
import * as Keywords from "@b/keywords";

/**
 * Concrete background-size values per CSS spec.
 */
const backgroundSizeSchema = bgSizeSchema;

/**
 * background-size value with universal CSS function support.
 * Can be a concrete bg-size (cover, contain, explicit dimensions)
 * OR a CssValue (var(), calc(), etc.)
 */
const backgroundSizeValueSchema = z.union([backgroundSizeSchema, cssValueSchema]);

/**
 * The final IR for the entire `background-size` property.
 */
export const backgroundSizeIR = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.cssWide,
  }),
  z.object({
    kind: z.literal("list"),
    values: z.array(backgroundSizeValueSchema).min(1),
  }),
]);

export type BackgroundSizeIR = z.infer<typeof backgroundSizeIR>;
