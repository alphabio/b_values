// b_path:: packages/b_declarations/src/properties/background-size/types.ts

import { lengthSchema, percentageSchema } from "@b/types";

import { z } from "zod";

/**
 * A single size value (width or height).
 * Can be auto, length, or percentage.
 */
export const sizeValueSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("auto") }),
  z.object({ kind: z.literal("length"), value: lengthSchema }),
  z.object({ kind: z.literal("percentage"), value: percentageSchema }),
]);

export type SizeValue = z.infer<typeof sizeValueSchema>;

/**
 * A single background size layer.
 * Can be a keyword (cover/contain) or explicit width/height values.
 */
export const sizeLayerSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: z.enum(["cover", "contain"]),
  }),
  z.object({
    kind: z.literal("explicit"),
    width: sizeValueSchema,
    height: sizeValueSchema,
  }),
]);

export type SizeLayer = z.infer<typeof sizeLayerSchema>;

/**
 * CSS background-size property value.
 * Syntax: `<bg-size>#` where `<bg-size> = [ <length-percentage [0,∞]> | auto ]{1,2} | cover | contain`
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-size
 */
export const backgroundSizeSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: z.enum(["inherit", "initial", "unset", "revert", "revert-layer"]),
  }),
  z.object({
    kind: z.literal("layers"),
    layers: z.array(sizeLayerSchema).min(1),
  }),
]);

export type BackgroundSize = z.infer<typeof backgroundSizeSchema>;
