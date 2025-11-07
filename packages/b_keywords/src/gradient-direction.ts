// b_path:: packages/b_keywords/src/gradient-direction.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient
 */
export const gradientSide = z.union([z.literal("top"), z.literal("right"), z.literal("bottom"), z.literal("left")]);

export const gradientCorner = z.union([
  z.literal("top left"),
  z.literal("top right"),
  z.literal("bottom left"),
  z.literal("bottom right"),
]);

export type GradientSide = z.infer<typeof gradientSide>;
export type GradientCorner = z.infer<typeof gradientCorner>;
