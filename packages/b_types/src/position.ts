// b_path:: packages/b_types/src/position.ts
import { z } from "zod";
import { cssValueSchema } from "./values";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/position_value
 */
export const position2DSchema = z
  .object({
    horizontal: cssValueSchema,
    vertical: cssValueSchema,
  })
  .strict();

export type Position2D = z.infer<typeof position2DSchema>;
