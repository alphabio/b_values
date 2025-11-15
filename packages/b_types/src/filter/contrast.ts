// b_path:: packages/b_types/src/filter/contrast.ts

import { z } from "zod";
import { percentageSchema } from "../percentage";

/**
 * Contrast filter function
 * @see https://drafts.fxtf.org/filter-effects/#funcdef-filter-contrast
 */

export const contrastFunctionSchema = z
  .object({
    kind: z.literal("contrast"),
    value: z.union([z.number(), percentageSchema]).optional(),
  })
  .strict();

export type ContrastFunction = z.infer<typeof contrastFunctionSchema>;
