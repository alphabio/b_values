// b_path:: packages/b_types/src/number.ts
import { z } from "zod";

/**
 * CSS <number> type - unitless numeric value
 * @see https://drafts.csswg.org/css-values-4/#numbers
 */
export const numberSchema = z.number();

export type CSSNumber = z.infer<typeof numberSchema>;
