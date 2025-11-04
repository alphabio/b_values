// b_path:: packages/b_types/src/color/hsl.ts
import { z } from "zod";
import { cssValueSchema } from "../values";

/**
 * HSL color representation using CssValue for flexible value types
 * Supports literals, variables (var()), keywords (none), and relative color syntax
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsl
 */
export const hslColorSchema = z.object({
  kind: z.literal("hsl"),
  h: cssValueSchema,
  s: cssValueSchema,
  l: cssValueSchema,
  alpha: cssValueSchema.optional(),
});

export type HSLColor = z.infer<typeof hslColorSchema>;
