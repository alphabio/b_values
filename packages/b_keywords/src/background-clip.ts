// b_path:: packages/b_keywords/src/background-clip.ts

import { getLiteralValues } from "./utils";
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-clip
 */
export const backgroundClip = z.union([
  z.literal("border-box"),
  z.literal("padding-box"),
  z.literal("content-box"),
  z.literal("text"),
]);

export const BACKGROUND_CLIP = getLiteralValues(backgroundClip);

export type BackgroundClip = z.infer<typeof backgroundClip>;
