// b_path:: packages/b_types/src/transform/skew.ts

import { z } from "zod";
import { angleSchema } from "../angle";

/**
 * Skew transform functions
 * @see https://drafts.csswg.org/css-transforms-2/#funcdef-skew
 */

export const skewSchema = z
  .object({
    kind: z.literal("skew"),
    x: angleSchema,
    y: angleSchema,
  })
  .strict();

export const skewXSchema = z
  .object({
    kind: z.literal("skewX"),
    x: angleSchema,
  })
  .strict();

export const skewYSchema = z
  .object({
    kind: z.literal("skewY"),
    y: angleSchema,
  })
  .strict();

export const skewFunctionSchema = z.union([skewSchema, skewXSchema, skewYSchema]);

export type Skew = z.infer<typeof skewSchema>;
export type SkewX = z.infer<typeof skewXSchema>;
export type SkewY = z.infer<typeof skewYSchema>;
export type SkewFunction = z.infer<typeof skewFunctionSchema>;
