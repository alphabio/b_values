// b_path:: packages/b_types/src/transform/matrix.ts

import { z } from "zod";

/**
 * Matrix transform functions
 * @see https://drafts.csswg.org/css-transforms-2/#funcdef-matrix
 */

export const matrixSchema = z
  .object({
    kind: z.literal("matrix"),
    a: z.number(),
    b: z.number(),
    c: z.number(),
    d: z.number(),
    e: z.number(),
    f: z.number(),
  })
  .strict();

export const matrix3dSchema = z
  .object({
    kind: z.literal("matrix3d"),
    values: z.tuple([
      z.number(),
      z.number(),
      z.number(),
      z.number(),
      z.number(),
      z.number(),
      z.number(),
      z.number(),
      z.number(),
      z.number(),
      z.number(),
      z.number(),
      z.number(),
      z.number(),
      z.number(),
      z.number(),
    ]),
  })
  .strict();

export const matrixFunctionSchema = z.union([matrixSchema, matrix3dSchema]);

export type Matrix = z.infer<typeof matrixSchema>;
export type Matrix3d = z.infer<typeof matrix3dSchema>;
export type MatrixFunction = z.infer<typeof matrixFunctionSchema>;
