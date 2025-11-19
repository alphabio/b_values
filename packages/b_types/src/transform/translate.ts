// b_path:: packages/b_types/src/transform/translate.ts

import { z } from "zod";
import { cssValueSchema } from "../values";

/**
 * Translate transform functions
 * @see https://drafts.csswg.org/css-transforms-2/#funcdef-translate
 */

export const translateSchema = z
  .object({
    kind: z.literal("translate"),
    x: cssValueSchema,
    y: cssValueSchema,
  })
  .strict();

export const translateXSchema = z
  .object({
    kind: z.literal("translateX"),
    x: cssValueSchema,
  })
  .strict();

export const translateYSchema = z
  .object({
    kind: z.literal("translateY"),
    y: cssValueSchema,
  })
  .strict();

export const translateZSchema = z
  .object({
    kind: z.literal("translateZ"),
    z: cssValueSchema,
  })
  .strict();

export const translate3dSchema = z
  .object({
    kind: z.literal("translate3d"),
    x: cssValueSchema,
    y: cssValueSchema,
    z: cssValueSchema,
  })
  .strict();

export const translateFunctionSchema = z.union([
  translateSchema,
  translateXSchema,
  translateYSchema,
  translateZSchema,
  translate3dSchema,
]);

export type Translate = z.infer<typeof translateSchema>;
export type TranslateX = z.infer<typeof translateXSchema>;
export type TranslateY = z.infer<typeof translateYSchema>;
export type TranslateZ = z.infer<typeof translateZSchema>;
export type Translate3d = z.infer<typeof translate3dSchema>;
export type TranslateFunction = z.infer<typeof translateFunctionSchema>;
