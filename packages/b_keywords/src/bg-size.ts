// b_path:: packages/b_keywords/src/bg-size.ts

import { z } from "zod";
import { getLiteralValues } from "./utils";

/**
 * Defines keywords for background-size and mask-size properties.
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-size#values
 */
export const bgSizeKeywordSchema = z.union([z.literal("auto"), z.literal("cover"), z.literal("contain")]);

// Extract the raw string values for convenience
export const BG_SIZE_KEYWORDS = getLiteralValues(bgSizeKeywordSchema);

export type BgSizeKeyword = z.infer<typeof bgSizeKeywordSchema>;
