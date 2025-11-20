// b_path:: packages/b_types/src/transform/matrix.ts

import { z } from "zod";
import { cssValueSchema } from "../values";

/**
 * Matrix transform functions
 * @see https://drafts.csswg.org/css-transforms-2/#funcdef-matrix
 */

export const matrixSchema = z
  .object({
    kind: z.literal("matrix"),
    a: cssValueSchema,
    b: cssValueSchema,
    c: cssValueSchema,
    d: cssValueSchema,
    e: cssValueSchema,
    f: cssValueSchema,
  })
  .strict();

export const matrix3dSchema = z
  .object({
    kind: z.literal("matrix3d"),
    values: z.tuple([
      cssValueSchema,
      cssValueSchema,
      cssValueSchema,
      cssValueSchema,
      cssValueSchema,
      cssValueSchema,
      cssValueSchema,
      cssValueSchema,
      cssValueSchema,
      cssValueSchema,
      cssValueSchema,
      cssValueSchema,
      cssValueSchema,
      cssValueSchema,
      cssValueSchema,
      cssValueSchema,
    ]),
  })
  .strict();

export const matrixFunctionSchema = z.union([matrixSchema, matrix3dSchema]);

export type Matrix = z.infer<typeof matrixSchema>;
export type Matrix3d = z.infer<typeof matrix3dSchema>;
export type MatrixFunction = z.infer<typeof matrixFunctionSchema>;
