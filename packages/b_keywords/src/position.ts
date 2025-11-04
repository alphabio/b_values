// b_path:: packages/b_keywords/src/position.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/position_value
 */
export const positionKeywordSchema = z.union([
  z.literal("center"),
  z.literal("left"),
  z.literal("right"),
  z.literal("top"),
  z.literal("bottom"),
]);

export type PositionKeyword = z.infer<typeof positionKeywordSchema>;

export const positionHorizontalEdgeSchema = z.union([z.literal("left"), z.literal("right")]);

export type PositionHorizontalEdge = z.infer<typeof positionHorizontalEdgeSchema>;

export const positionVerticalEdgeSchema = z.union([z.literal("top"), z.literal("bottom")]);

export type PositionVerticalEdge = z.infer<typeof positionVerticalEdgeSchema>;
