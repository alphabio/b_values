// b_path:: packages/b_units/src/percentage.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/percentage
 */
export const percentageUnitSchema = z.literal("%");

export type PercentageUnit = z.infer<typeof percentageUnitSchema>;
