import { z } from "zod";
import { percentageUnitSchema } from "@b/units";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/percentage
 */
export const percentageSchema = z.object({
  value: z.number(),
  unit: percentageUnitSchema,
});

export type Percentage = z.infer<typeof percentageSchema>;
