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

export type FontLengthUnit = z.infer<typeof fontLengthUnitSchema>;
