import { z } from "zod";
import { absoluteLengthUnitSchema } from "./length-absolute";
import { fontLengthUnitSchema } from "./length-font";
import { viewportLengthUnitSchema } from "./length-viewport";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/length
 */
export const lengthUnitSchema = z.union([
	absoluteLengthUnitSchema,
	fontLengthUnitSchema,
	viewportLengthUnitSchema,
]);

export type LengthUnit = z.infer<typeof lengthUnitSchema>;
