// b_path:: packages/b_types/src/color/hwb.ts
import { z } from "zod";
import { cssValueSchema } from "../values";

/**
 * HWB color representation using CssValue for flexible value types
 * Supports literals, variables (var()), keywords (none), and relative color syntax
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hwb
 */
export const hwbColorSchema = z
  .object({
    kind: z.literal("hwb"),
    h: cssValueSchema,
    w: cssValueSchema,
    b: cssValueSchema,
    alpha: cssValueSchema.optional(),
  })
  .strict();

export type HWBColor = z.infer<typeof hwbColorSchema>;
