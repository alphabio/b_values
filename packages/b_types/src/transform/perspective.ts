// b_path:: packages/b_types/src/transform/perspective.ts

import { z } from "zod";
import { cssValueSchema } from "../values";

/**
 * Perspective transform function
 * @see https://drafts.csswg.org/css-transforms-2/#funcdef-perspective
 */

export const perspectiveFunctionSchema = z
  .object({
    kind: z.literal("perspective"),
    length: cssValueSchema,
  })
  .strict();

export type PerspectiveFunction = z.infer<typeof perspectiveFunctionSchema>;
