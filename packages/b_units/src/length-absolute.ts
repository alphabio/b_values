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

export type AbsoluteLengthUnit = z.infer<typeof absoluteLengthUnitSchema>;
