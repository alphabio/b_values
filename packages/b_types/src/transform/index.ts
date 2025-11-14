// b_path:: packages/b_types/src/transform/index.ts

export * from "./translate";
export * from "./rotate";
export * from "./scale";
export * from "./skew";
export * from "./matrix";
export * from "./perspective";

import { z } from "zod";
import { translateFunctionSchema } from "./translate";
import { rotateFunctionSchema } from "./rotate";
import { scaleFunctionSchema } from "./scale";
import { skewFunctionSchema } from "./skew";
import { matrixFunctionSchema } from "./matrix";
import { perspectiveFunctionSchema } from "./perspective";

/**
 * Union of all transform functions
 */
export const transformFunctionSchema = z.union([
  translateFunctionSchema,
  rotateFunctionSchema,
  scaleFunctionSchema,
  skewFunctionSchema,
  matrixFunctionSchema,
  perspectiveFunctionSchema,
]);

export type TransformFunction = z.infer<typeof transformFunctionSchema>;

/**
 * Transform list (used by transform property)
 */
export const transformListSchema = z.array(transformFunctionSchema);

export type TransformList = z.infer<typeof transformListSchema>;
