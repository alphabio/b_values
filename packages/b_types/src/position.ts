import { z } from "zod";
import { positionKeywordSchema } from "@b/keywords";
import { lengthPercentageSchema } from "./length-percentage";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/position_value
 */
export const positionValueSchema = z.union([positionKeywordSchema, lengthPercentageSchema]);

export type PositionValue = z.infer<typeof positionValueSchema>;

export const position2DSchema = z.object({
  horizontal: positionValueSchema,
  vertical: positionValueSchema,
});

export type Position2D = z.infer<typeof position2DSchema>;
