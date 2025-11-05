// b_path:: packages/b_types/src/angle.ts
import { z } from "zod";
import { angleUnitSchema } from "@b/units";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/angle
 */
export const angleSchema = z
  .object({
    value: z.number(),
    unit: angleUnitSchema.optional(),
  })
  .strict();

export type Angle = z.infer<typeof angleSchema>;
