// b_path:: packages/b_declarations/src/properties/background-blend-mode/types.ts

import { z } from "zod";
import * as Keywords from "@b/keywords";
import { cssValueSchema } from "@b/types";

/**
 * background-blend-mode value with universal CSS function support.
 */
const backgroundBlendModeValueSchema = z.union([Keywords.blendMode, cssValueSchema]);

export type BackgroundBlendModeValue = z.infer<typeof backgroundBlendModeValueSchema>;

/**
 * The final IR for the entire `background-blend-mode` property.
 */
export const backgroundBlendModeIRSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.cssWide,
  }),
  z.object({
    kind: z.literal("list"),
    values: z.array(backgroundBlendModeValueSchema).min(1),
  }),
]);

export type BackgroundBlendModeIR = z.infer<typeof backgroundBlendModeIRSchema>;
