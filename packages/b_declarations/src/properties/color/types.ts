// b_path:: packages/b_declarations/src/properties/color/types.ts

import { z } from "zod";
import { colorSchema } from "@b/types";
import * as Keywords from "@b/keywords";

export const colorIRSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.cssWide,
  }),
  z.object({
    kind: z.literal("value"),
    value: colorSchema,
  }),
]);

export type ColorIR = z.infer<typeof colorIRSchema>;
