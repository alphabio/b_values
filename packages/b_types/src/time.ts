// b_path:: packages/b_types/src/time.ts
import { z } from "zod";
import { timeUnitSchema } from "@b/units";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/time
 */
export const timeSchema = z
  .object({
    value: z.number(),
    unit: timeUnitSchema,
  })
  .strict();

export type Time = z.infer<typeof timeSchema>;
