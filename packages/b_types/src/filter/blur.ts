// b_path:: packages/b_types/src/filter/blur.ts

import { z } from "zod";
import { lengthSchema } from "../length";

/**
 * Blur filter function
 * @see https://drafts.fxtf.org/filter-effects/#funcdef-filter-blur
 */

export const blurFunctionSchema = z
  .object({
    kind: z.literal("blur"),
    length: lengthSchema.optional(),
  })
  .strict();

export type BlurFunction = z.infer<typeof blurFunctionSchema>;
