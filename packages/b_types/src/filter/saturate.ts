// b_path:: packages/b_types/src/filter/saturate.ts

import { z } from "zod";
import { percentageSchema } from "../percentage";

/**
 * Saturate filter function
 * @see https://drafts.fxtf.org/filter-effects/#funcdef-filter-saturate
 */

export const saturateFunctionSchema = z
  .object({
    kind: z.literal("saturate"),
    value: z.union([z.number(), percentageSchema]).optional(),
  })
  .strict();

export type SaturateFunction = z.infer<typeof saturateFunctionSchema>;
