// b_path:: packages/b_declarations/src/utilities/position/types.ts

import { z } from "zod";
import { position2DSchema, cssValueSchema } from "@b/types";
import * as Keywords from "@b/keywords";

/**
 * background-position value with universal CSS function support.
 */
const backgroundPositionValueSchema = z.union([position2DSchema, cssValueSchema]);

/**
 * The final IR for the entire `background-position` property.
 */
export const backgroundPositionIRSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.cssWide,
  }),
  z.object({
    kind: z.literal("list"),
    values: z.array(backgroundPositionValueSchema).min(1),
  }),
]);

export type BackgroundPositionIR = z.infer<typeof backgroundPositionIRSchema>;
