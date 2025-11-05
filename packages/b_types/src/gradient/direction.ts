// b_path:: packages/b_types/src/gradient/direction.ts
import { z } from "zod";
import { gradientCornerSchema, gradientSideSchema } from "@b/keywords";
import { angleSchema } from "../angle";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient
 */
export const gradientDirectionSchema = z.union([
  z
    .object({
      kind: z.literal("angle"),
      value: angleSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("to-side"),
      value: gradientSideSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("to-corner"),
      value: gradientCornerSchema,
    })
    .strict(),
]);

export type GradientDirection = z.infer<typeof gradientDirectionSchema>;
