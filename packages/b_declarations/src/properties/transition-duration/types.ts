// b_path:: packages/b_declarations/src/properties/transition-duration/types.ts

import { z } from "zod";
import { timeSchema } from "@b/types";
import * as Keywords from "@b/keywords";

export const transitionDurationIRSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.cssWide,
  }),
  z.object({
    kind: z.literal("value"),
    value: timeSchema,
  }),
]);

export type TransitionDurationIR = z.infer<typeof transitionDurationIRSchema>;
