import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/angle
 */
export const angleUnitSchema = z.union([
	z.literal("deg"),
	z.literal("grad"),
	z.literal("rad"),
	z.literal("turn"),
]);

export type AngleUnit = z.infer<typeof angleUnitSchema>;
