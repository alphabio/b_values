import { z } from "zod";
import { lengthSchema } from "./length";
import { percentageSchema } from "./percentage";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/length-percentage
 */
export const lengthPercentageSchema = z.union([lengthSchema, percentageSchema]);

export type LengthPercentage = z.infer<typeof lengthPercentageSchema>;
