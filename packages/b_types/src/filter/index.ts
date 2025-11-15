// b_path:: packages/b_types/src/filter/index.ts

export * from "./blur";
export * from "./brightness";
export * from "./contrast";
export * from "./grayscale";
export * from "./hue-rotate";
export * from "./invert";
export * from "./opacity";
export * from "./saturate";
export * from "./sepia";
export * from "./drop-shadow";

import { z } from "zod";
import { blurFunctionSchema } from "./blur";
import { brightnessFunctionSchema } from "./brightness";
import { contrastFunctionSchema } from "./contrast";
import { grayscaleFunctionSchema } from "./grayscale";
import { hueRotateFunctionSchema } from "./hue-rotate";
import { invertFunctionSchema } from "./invert";
import { opacityFunctionSchema } from "./opacity";
import { saturateFunctionSchema } from "./saturate";
import { sepiaFunctionSchema } from "./sepia";
import { dropShadowFunctionSchema } from "./drop-shadow";

/**
 * Union of all filter functions
 */
export const filterFunctionSchema = z.union([
  blurFunctionSchema,
  brightnessFunctionSchema,
  contrastFunctionSchema,
  grayscaleFunctionSchema,
  hueRotateFunctionSchema,
  invertFunctionSchema,
  opacityFunctionSchema,
  saturateFunctionSchema,
  sepiaFunctionSchema,
  dropShadowFunctionSchema,
]);

export type FilterFunction = z.infer<typeof filterFunctionSchema>;

/**
 * Filter list (used by filter and backdrop-filter properties)
 */
export const filterListSchema = z.array(filterFunctionSchema);

export type FilterList = z.infer<typeof filterListSchema>;
