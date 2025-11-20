// b_path:: packages/b_types/src/filter/grayscale.ts

import { z } from "zod";
import { percentageSchema } from "../percentage";

/**
 * Grayscale filter function
 * @see https://drafts.fxtf.org/filter-effects/#funcdef-filter-grayscale
 */

export const grayscaleFunctionSchema = z
  .object({
    kind: z.literal("grayscale"),
    value: z.union([z.number(), percentageSchema]).optional(),
  })
  .strict();

export type GrayscaleFunction = z.infer<typeof grayscaleFunctionSchema>;
