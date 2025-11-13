// b_path:: packages/b_declarations/src/properties/border-right-color/types.ts

import { z } from "zod";
import { colorSchema } from "@b/types";
import * as Keywords from "@b/keywords";

/**
 * The final IR for the entire `border-right-color` property.
 */
export const borderRightColorIRSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.cssWide,
  }),
  z.object({
    kind: z.literal("value"),
    value: colorSchema,
  }),
]);

export type BorderRightColorIR = z.infer<typeof borderRightColorIRSchema>;
