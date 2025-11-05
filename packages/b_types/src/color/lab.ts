// b_path:: packages/b_types/src/color/lab.ts
import { z } from "zod";
import { cssValueSchema } from "../values";

/**
 * LAB color representation using CssValue for flexible value types
 * Supports literals, variables (var()), keywords (none), and relative color syntax
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/lab
 */
export const labColorSchema = z
  .object({
    kind: z.literal("lab"),
    l: cssValueSchema,
    a: cssValueSchema,
    b: cssValueSchema,
    alpha: cssValueSchema.optional(),
  })
  .strict();

export type LABColor = z.infer<typeof labColorSchema>;
