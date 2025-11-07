// b_path:: packages/b_keywords/src/radial-size.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/radial-gradient
 */
export const radialSizeKeyword = z.union([
  z.literal("closest-side"),
  z.literal("farthest-side"),
  z.literal("closest-corner"),
  z.literal("farthest-corner"),
]);

export type RadialSizeKeyword = z.infer<typeof radialSizeKeyword>;
