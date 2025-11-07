// b_path:: packages/b_keywords/src/position.ts
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/position_value
 */
export const positionKeyword = z.union([
  z.literal("center"),
  z.literal("left"),
  z.literal("right"),
  z.literal("top"),
  z.literal("bottom"),
  z.literal("x-start"),
  z.literal("x-end"),
  z.literal("y-start"),
  z.literal("y-end"),
  z.literal("block-start"),
  z.literal("block-end"),
  z.literal("inline-start"),
  z.literal("inline-end"),
  z.literal("start"),
  z.literal("end"),
]);

export type PositionKeyword = z.infer<typeof positionKeyword>;

export const positionHorizontalEdge = z.union([
  z.literal("left"),
  z.literal("right"),
  z.literal("x-start"),
  z.literal("x-end"),
]);

export type PositionHorizontalEdge = z.infer<typeof positionHorizontalEdge>;

export const positionVerticalEdge = z.union([
  z.literal("top"),
  z.literal("bottom"),
  z.literal("y-start"),
  z.literal("y-end"),
]);

export type PositionVerticalEdge = z.infer<typeof positionVerticalEdge>;
