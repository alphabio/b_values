// b_path:: packages/b_declarations/src/properties/transition-timing-function/types.ts

import { z } from "zod";
import { easingFunctionSchema } from "@b/types";
import * as Keywords from "@b/keywords";

export const transitionTimingFunctionIRSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.cssWide,
  }),
  z.object({
    kind: z.literal("value"),
    value: easingFunctionSchema,
  }),
]);

export type TransitionTimingFunctionIR = z.infer<typeof transitionTimingFunctionIRSchema>;
