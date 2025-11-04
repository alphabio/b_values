// b_path:: packages/b_units/src/length-absolute.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/length#absolute_length_units
 */
export const absoluteLengthUnitSchema = z.union([
  z.literal("px"),
  z.literal("pt"),
  z.literal("cm"),
  z.literal("mm"),
  z.literal("Q"),
  z.literal("in"),
  z.literal("pc"),
]);

export const ABSOLUTE_LENGTH_UNITS = absoluteLengthUnitSchema.options.map((option) => option.value);

export type AbsoluteLengthUnit = z.infer<typeof absoluteLengthUnitSchema>;
