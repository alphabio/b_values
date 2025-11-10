// b_path:: packages/b_declarations/src/properties/background-color/types.ts

import { z } from "zod";
import { colorSchema } from "@b/types";
import * as Keywords from "@b/keywords";

/**
 * The final IR for the entire `background-color` property.
 */
export const backgroundColorIRSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.cssWide,
  }),
  z.object({
    kind: z.literal("value"),
    value: colorSchema,
  }),
]);

export type BackgroundColorIR = z.infer<typeof backgroundColorIRSchema>;
