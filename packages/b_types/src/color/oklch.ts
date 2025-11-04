// b_path:: packages/b_types/src/color/oklch.ts
import { z } from "zod";
import { cssValueSchema } from "../values";

/**
 * OKLCH color representation using CssValue for flexible value types
 * Supports literals, variables (var()), keywords (none), and relative color syntax
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch
 */
export const oklchColorSchema = z.object({
  kind: z.literal("oklch"),
  l: cssValueSchema,
  c: cssValueSchema,
  h: cssValueSchema,
  alpha: cssValueSchema.optional(),
});

export type OKLCHColor = z.infer<typeof oklchColorSchema>;
