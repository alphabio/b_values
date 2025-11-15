// b_path:: packages/b_types/src/filter/sepia.ts

import { z } from "zod";
import { percentageSchema } from "../percentage";

/**
 * Sepia filter function
 * @see https://drafts.fxtf.org/filter-effects/#funcdef-filter-sepia
 */

export const sepiaFunctionSchema = z
  .object({
    kind: z.literal("sepia"),
    value: z.union([z.number(), percentageSchema]).optional(),
  })
  .strict();

export type SepiaFunction = z.infer<typeof sepiaFunctionSchema>;
