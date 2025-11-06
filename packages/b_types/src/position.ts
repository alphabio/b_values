// b_path:: packages/b_types/src/position.ts
import { z } from "zod";
import { cssValueSchema } from "./values";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/position_value
 */

// Edge offset for 3/4-value position syntax
export const positionEdgeOffsetSchema = z
  .object({
    edge: z.enum(["left", "right", "top", "bottom"]),
    offset: cssValueSchema,
  })
  .strict();

export type PositionEdgeOffset = z.infer<typeof positionEdgeOffsetSchema>;

// Position can be simple value or edge+offset
export const position2DSchema = z
  .object({
    horizontal: z.union([cssValueSchema, positionEdgeOffsetSchema]),
    vertical: z.union([cssValueSchema, positionEdgeOffsetSchema]),
  })
  .strict();

export type Position2D = z.infer<typeof position2DSchema>;
