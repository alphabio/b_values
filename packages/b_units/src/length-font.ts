// b_path:: packages/b_units/src/length-font.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/length#font-relative_lengths
 */
export const fontLengthUnitSchema = z.union([
  z.literal("em"),
  z.literal("ex"),
  z.literal("cap"),
  z.literal("ch"),
  z.literal("ic"),
  z.literal("rem"),
  z.literal("rex"),
  z.literal("rcap"),
  z.literal("rch"),
  z.literal("ric"),
  z.literal("lh"),
  z.literal("rlh"),
]);

export const FONT_LENGTH_UNITS = fontLengthUnitSchema.options.map((option) => option.value);

export type FontLengthUnit = z.infer<typeof fontLengthUnitSchema>;
