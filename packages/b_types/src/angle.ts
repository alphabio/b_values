import { z } from "zod";
import { angleUnitSchema } from "@b/units";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/angle
 */
export const angleSchema = z.object({
  value: z.number(),
  unit: angleUnitSchema,
});

export type Angle = z.infer<typeof angleSchema>;
