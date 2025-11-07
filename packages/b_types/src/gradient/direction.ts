// b_path:: packages/b_types/src/gradient/direction.ts
import { z } from "zod";
import * as Keywords from "@b/keywords";
import { cssValueSchema } from "../values";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient
 */
export const gradientDirectionSchema = z.union([
  z
    .object({
      kind: z.literal("angle"),
      value: cssValueSchema, // Changed from angleSchema to support var/calc
    })
    .strict(),
  z
    .object({
      kind: z.literal("to-side"),
      value: Keywords.gradientSide,
    })
    .strict(),
  z
    .object({
      kind: z.literal("to-corner"),
      value: Keywords.gradientCorner,
    })
    .strict(),
]);

export type GradientDirection = z.infer<typeof gradientDirectionSchema>;
