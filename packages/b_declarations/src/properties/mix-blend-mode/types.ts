// b_path:: packages/b_declarations/src/properties/mix-blend-mode/types.ts

import { z } from "zod";
import * as Keywords from "@b/keywords";
import { cssValueSchema } from "@b/types";

/**
 * mix-blend-mode value with universal CSS function support.
 */
const mixBlendModeValueSchema = z.union([Keywords.blendMode, cssValueSchema]);

export type MixBlendModeValue = z.infer<typeof mixBlendModeValueSchema>;

/**
 * The final IR for the entire `mix-blend-mode` property.
 */
export const mixBlendModeIRSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.cssWide,
  }),
  z.object({
    kind: z.literal("value"),
    value: mixBlendModeValueSchema,
  }),
]);

export type MixBlendModeIR = z.infer<typeof mixBlendModeIRSchema>;
