// b_path:: packages/b_types/src/transform/scale.ts

import { z } from "zod";

/**
 * Scale transform functions
 * @see https://drafts.csswg.org/css-transforms-2/#funcdef-scale
 */

export const scaleSchema = z
  .object({
    kind: z.literal("scale"),
    x: z.number(),
    y: z.number(),
  })
  .strict();

export const scaleXSchema = z
  .object({
    kind: z.literal("scaleX"),
    x: z.number(),
  })
  .strict();

export const scaleYSchema = z
  .object({
    kind: z.literal("scaleY"),
    y: z.number(),
  })
  .strict();

export const scaleZSchema = z
  .object({
    kind: z.literal("scaleZ"),
    z: z.number(),
  })
  .strict();

export const scale3dSchema = z
  .object({
    kind: z.literal("scale3d"),
    x: z.number(),
    y: z.number(),
    z: z.number(),
  })
  .strict();

export const scaleFunctionSchema = z.union([scaleSchema, scaleXSchema, scaleYSchema, scaleZSchema, scale3dSchema]);

export type Scale = z.infer<typeof scaleSchema>;
export type ScaleX = z.infer<typeof scaleXSchema>;
export type ScaleY = z.infer<typeof scaleYSchema>;
export type ScaleZ = z.infer<typeof scaleZSchema>;
export type Scale3d = z.infer<typeof scale3dSchema>;
export type ScaleFunction = z.infer<typeof scaleFunctionSchema>;
