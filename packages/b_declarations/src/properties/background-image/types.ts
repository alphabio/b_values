// b_path:: packages/b_declarations/src/properties/background-image/types.ts
import { imageSchema, cssValueSchema } from "@b/types";
import { z } from "zod";
import * as Keywords from "@b/keywords";

/**
 * Concrete background-image values per CSS spec.
 * Image type now includes "none" at the concrete layer.
 */
const backgroundImageSchema = imageSchema;

/**
 * background-image value with universal CSS function support.
 */
const backgroundImageValueSchema = z.union([backgroundImageSchema, cssValueSchema]);

/**
 * The final IR for the entire `background-image` property.
 */
export const backgroundImageIR = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: z.union([Keywords.cssWide, Keywords.none]),
  }),
  z.object({
    kind: z.literal("list"),
    values: z.array(backgroundImageValueSchema).min(1),
  }),
]);

export type BackgroundImageIR = z.infer<typeof backgroundImageIR>;
