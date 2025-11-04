import { z } from "zod";
import { lengthUnitSchema } from "@b/units";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/length
 */
export const lengthSchema = z.object({
  value: z.number(),
  unit: lengthUnitSchema,
});

export type Length = z.infer<typeof lengthSchema>;
