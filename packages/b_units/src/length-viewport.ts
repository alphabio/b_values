// b_path:: packages/b_units/src/length-viewport.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/length#viewport-percentage_lengths
 */
export const viewportLengthUnitSchema = z.union([
  z.literal("vw"),
  z.literal("vh"),
  z.literal("vi"),
  z.literal("vb"),
  z.literal("vmin"),
  z.literal("vmax"),
  z.literal("svw"),
  z.literal("svh"),
  z.literal("svi"),
  z.literal("svb"),
  z.literal("svmin"),
  z.literal("svmax"),
  z.literal("lvw"),
  z.literal("lvh"),
  z.literal("lvi"),
  z.literal("lvb"),
  z.literal("lvmin"),
  z.literal("lvmax"),
  z.literal("dvw"),
  z.literal("dvh"),
  z.literal("dvi"),
  z.literal("dvb"),
  z.literal("dvmin"),
  z.literal("dvmax"),
]);

export type ViewportLengthUnit = z.infer<typeof viewportLengthUnitSchema>;
