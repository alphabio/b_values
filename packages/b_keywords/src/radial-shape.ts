import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/radial-gradient
 */
export const radialShapeSchema = z.union([z.literal("circle"), z.literal("ellipse")]);

export type RadialShape = z.infer<typeof radialShapeSchema>;
