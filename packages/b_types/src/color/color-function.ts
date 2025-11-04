// b_path:: packages/b_types/src/color/color-function.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color
 */
export const colorFunctionSchema = z.object({
  kind: z.literal("color"),
  colorSpace: z.enum([
    "srgb",
    "srgb-linear",
    "display-p3",
    "a98-rgb",
    "prophoto-rgb",
    "rec2020",
    "xyz",
    "xyz-d50",
    "xyz-d65",
  ]),
  channels: z.tuple([z.number(), z.number(), z.number()]),
  alpha: z.number().min(0).max(1).optional(),
});

export type ColorFunction = z.infer<typeof colorFunctionSchema>;
