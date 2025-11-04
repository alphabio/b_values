import { z } from "zod";
import { gradientCornerSchema, gradientSideSchema } from "@b/keywords";
import { angleSchema } from "../angle";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient
 */
export const gradientDirectionSchema = z.union([
  z.object({
    kind: z.literal("angle"),
    value: angleSchema,
  }),
  z.object({
    kind: z.literal("to-side"),
    value: gradientSideSchema,
  }),
  z.object({
    kind: z.literal("to-corner"),
    value: gradientCornerSchema,
  }),
]);

export type GradientDirection = z.infer<typeof gradientDirectionSchema>;
