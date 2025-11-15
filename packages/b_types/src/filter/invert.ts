// b_path:: packages/b_types/src/filter/invert.ts

import { z } from "zod";
import { percentageSchema } from "../percentage";

/**
 * Invert filter function
 * @see https://drafts.fxtf.org/filter-effects/#funcdef-filter-invert
 */

export const invertFunctionSchema = z
  .object({
    kind: z.literal("invert"),
    value: z.union([z.number(), percentageSchema]).optional(),
  })
  .strict();

export type InvertFunction = z.infer<typeof invertFunctionSchema>;
