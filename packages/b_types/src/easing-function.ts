// b_path:: packages/b_types/src/easing-function.ts
import { z } from "zod";
import * as Keywords from "@b/keywords";

/**
 * Easing function type
 * @see https://drafts.csswg.org/css-easing-1/#typedef-easing-function
 */
export const easingFunctionSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.easingKeywordSchema,
  }),
  z.object({
    kind: z.literal("cubic-bezier"),
    x1: z.number(),
    y1: z.number(),
    x2: z.number(),
    y2: z.number(),
  }),
  z.object({
    kind: z.literal("steps"),
    count: z.number().int().positive(),
    position: Keywords.stepsPositionSchema.optional(),
  }),
]);

export type EasingFunction = z.infer<typeof easingFunctionSchema>;
