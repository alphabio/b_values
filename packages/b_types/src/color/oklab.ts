// b_path:: packages/b_types/src/color/oklab.ts
import { z } from "zod";
import { cssValueSchema } from "../values";

/**
 * OKLab color representation using CssValue for flexible value types
 * Supports literals, variables (var()), keywords (none), and relative color syntax
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklab
 */
export const oklabColorSchema = z.object({
  kind: z.literal("oklab"),
  l: cssValueSchema,
  a: cssValueSchema,
  b: cssValueSchema,
  alpha: cssValueSchema.optional(),
});

export type OKLabColor = z.infer<typeof oklabColorSchema>;
