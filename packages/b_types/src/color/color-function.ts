// b_path:: packages/b_types/src/color/color-function.ts
import { z } from "zod";
import { cssValueSchema } from "../values";

/**
 * color() function representation using CssValue for flexible value types
 * Supports literals, variables (var()), keywords (none), and relative color syntax
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
  channels: z.tuple([cssValueSchema, cssValueSchema, cssValueSchema]),
  alpha: cssValueSchema.optional(),
});

export type ColorFunction = z.infer<typeof colorFunctionSchema>;
