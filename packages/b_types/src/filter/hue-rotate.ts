// b_path:: packages/b_types/src/filter/hue-rotate.ts

import { z } from "zod";
import { angleSchema } from "../angle";

/**
 * Hue-rotate filter function
 * @see https://drafts.fxtf.org/filter-effects/#funcdef-filter-hue-rotate
 */

export const hueRotateFunctionSchema = z
  .object({
    kind: z.literal("hue-rotate"),
    angle: angleSchema.optional(),
  })
  .strict();

export type HueRotateFunction = z.infer<typeof hueRotateFunctionSchema>;
