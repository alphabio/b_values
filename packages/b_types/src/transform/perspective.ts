// b_path:: packages/b_types/src/transform/perspective.ts

import { z } from "zod";
import { lengthSchema } from "../length";

/**
 * Perspective transform function
 * @see https://drafts.csswg.org/css-transforms-2/#funcdef-perspective
 */

export const perspectiveFunctionSchema = z
  .object({
    kind: z.literal("perspective"),
    length: lengthSchema,
  })
  .strict();

export type PerspectiveFunction = z.infer<typeof perspectiveFunctionSchema>;
