// b_path:: packages/b_types/src/filter/opacity.ts

import { z } from "zod";
import { percentageSchema } from "../percentage";

/**
 * Opacity filter function
 * @see https://drafts.fxtf.org/filter-effects/#funcdef-filter-opacity
 */

export const opacityFunctionSchema = z
  .object({
    kind: z.literal("opacity"),
    value: z.union([z.number(), percentageSchema]).optional(),
  })
  .strict();

export type OpacityFunction = z.infer<typeof opacityFunctionSchema>;
