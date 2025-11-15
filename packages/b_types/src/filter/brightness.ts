// b_path:: packages/b_types/src/filter/brightness.ts

import { z } from "zod";
import { percentageSchema } from "../percentage";

/**
 * Brightness filter function
 * @see https://drafts.fxtf.org/filter-effects/#funcdef-filter-brightness
 */

export const brightnessFunctionSchema = z
  .object({
    kind: z.literal("brightness"),
    value: z.union([z.number(), percentageSchema]).optional(),
  })
  .strict();

export type BrightnessFunction = z.infer<typeof brightnessFunctionSchema>;
