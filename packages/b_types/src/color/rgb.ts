// b_path:: packages/b_types/src/color/rgb.ts
import { z } from "zod";
import { cssValueSchema } from "../values";

/**
 * RGB color representation using CssValue for flexible value types
 * Supports literals, variables (var()), keywords (none), and relative color syntax
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/rgb
 */
export const rgbColorSchema = z
  .object({
    kind: z.literal("rgb"),
    r: cssValueSchema,
    g: cssValueSchema,
    b: cssValueSchema,
    alpha: cssValueSchema.optional(),
  })
  .strict();

export type RGBColor = z.infer<typeof rgbColorSchema>;
