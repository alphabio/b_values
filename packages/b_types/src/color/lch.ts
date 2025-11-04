// b_path:: packages/b_types/src/color/lch.ts
import { z } from "zod";
import { cssValueSchema } from "../values";

/**
 * LCH color representation using CssValue for flexible value types
 * Supports literals, variables (var()), keywords (none), and relative color syntax
 * @see https://drafts.csswg.org/css-color/#lch-colors
 */
export const lchColorSchema = z.object({
  kind: z.literal("lch"),
  l: cssValueSchema,
  c: cssValueSchema,
  h: cssValueSchema,
  alpha: cssValueSchema.optional(),
});

export type LCHColor = z.infer<typeof lchColorSchema>;
