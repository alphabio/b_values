// b_path:: packages/b_declarations/src/properties/background-image/types.ts
import { imageSchema, cssValueSchema } from "@b/types";
import { z } from "zod";
import * as Keywords from "@b/keywords";

/**
 * Concrete background-image values per CSS spec.
 * @see https://www.w3.org/TR/css-backgrounds-3/#background-image
 */
const backgroundImageSchema = imageSchema;

/**
 * background-image value with universal CSS function support.
 * Can be a concrete image (url, gradient, etc.) OR a CssValue (var(), calc(), etc.)
 */
const backgroundImageValueSchema = z.union([backgroundImageSchema, cssValueSchema]);

/**
 * The final IR for the entire `background-image` property.
 * Supports CSS-wide keywords or a list of <image> values.
 */
export const backgroundImageIR = z.discriminatedUnion("kind", [
  // For global keywords like 'inherit', 'unset', etc.
  z.object({
    kind: z.literal("keyword"),
    value: z.union([Keywords.cssWide, Keywords.none]),
  }),
  // For one or more <image> values
  z.object({
    kind: z.literal("list"),
    values: z.array(backgroundImageValueSchema).min(1),
  }),
]);

export type BackgroundImageIR = z.infer<typeof backgroundImageIR>;
