// b_path:: packages/b_keywords/src/radial-shape.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/radial-gradient
 */
export const radialShape = z.union([z.literal("circle"), z.literal("ellipse")]);

export type RadialShape = z.infer<typeof radialShape>;
