// b_path:: packages/b_declarations/src/properties/animation-duration/types.ts

import { z } from "zod";
import { timeSchema, type CssValue } from "@b/types";
import * as Keywords from "@b/keywords";

export const animationDurationIRSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("keyword"), value: Keywords.cssWide }),
  z.object({ kind: z.literal("time"), value: timeSchema }),
  z.object({ kind: z.literal("value"), value: z.custom<CssValue>() }),
]);

export type AnimationDurationIR = z.infer<typeof animationDurationIRSchema>;
