// b_path:: packages/b_keywords/src/background-origin.ts

import { getLiteralValues } from "./utils";
import { z } from "zod";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-origin
 */
export const backgroundOrigin = z.union([z.literal("border-box"), z.literal("padding-box"), z.literal("content-box")]);

export const BACKGROUND_ORIGIN = getLiteralValues(backgroundOrigin);

export type BackgroundOrigin = z.infer<typeof backgroundOrigin>;
