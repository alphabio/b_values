// b_path:: packages/b_types/src/gradient/index.ts
export * from "./conic";
export * from "./direction";
export * from "./linear";
export * from "./radial";
export * from "./radial-size";

import { z } from "zod";
import { conicGradientSchema } from "./conic";
import { linearGradientSchema } from "./linear";
import { radialGradientSchema } from "./radial";

export const gradientSchema = z.union([linearGradientSchema, radialGradientSchema, conicGradientSchema]);

export type Gradient = z.infer<typeof gradientSchema>;
