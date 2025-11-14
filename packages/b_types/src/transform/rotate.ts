// b_path:: packages/b_types/src/transform/rotate.ts

import { z } from "zod";
import { angleSchema } from "../angle";

/**
 * Rotate transform functions
 * @see https://drafts.csswg.org/css-transforms-2/#funcdef-rotate
 */

export const rotateSchema = z
  .object({
    kind: z.literal("rotate"),
    angle: angleSchema,
  })
  .strict();

export const rotateXSchema = z
  .object({
    kind: z.literal("rotateX"),
    angle: angleSchema,
  })
  .strict();

export const rotateYSchema = z
  .object({
    kind: z.literal("rotateY"),
    angle: angleSchema,
  })
  .strict();

export const rotateZSchema = z
  .object({
    kind: z.literal("rotateZ"),
    angle: angleSchema,
  })
  .strict();

export const rotate3dSchema = z
  .object({
    kind: z.literal("rotate3d"),
    x: z.number(),
    y: z.number(),
    z: z.number(),
    angle: angleSchema,
  })
  .strict();

export const rotateFunctionSchema = z.union([
  rotateSchema,
  rotateXSchema,
  rotateYSchema,
  rotateZSchema,
  rotate3dSchema,
]);

export type Rotate = z.infer<typeof rotateSchema>;
export type RotateX = z.infer<typeof rotateXSchema>;
export type RotateY = z.infer<typeof rotateYSchema>;
export type RotateZ = z.infer<typeof rotateZSchema>;
export type Rotate3d = z.infer<typeof rotate3dSchema>;
export type RotateFunction = z.infer<typeof rotateFunctionSchema>;
