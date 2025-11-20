// b_path:: packages/b_types/src/filter/drop-shadow.ts

import { z } from "zod";
import { lengthSchema } from "../length";
import { colorSchema } from "../color";

/**
 * Drop-shadow filter function
 * @see https://drafts.fxtf.org/filter-effects/#funcdef-filter-drop-shadow
 */

export const dropShadowFunctionSchema = z
  .object({
    kind: z.literal("drop-shadow"),
    offsetX: lengthSchema,
    offsetY: lengthSchema,
    blurRadius: lengthSchema.optional(),
    color: colorSchema.optional(),
  })
  .strict();

export type DropShadowFunction = z.infer<typeof dropShadowFunctionSchema>;
