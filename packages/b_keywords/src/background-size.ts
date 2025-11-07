// b_path:: packages/b_keywords/src/background-size.ts

/**
 * CSS background-size keyword values.
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-size
 */
export const BACKGROUND_SIZE_KEYWORDS = ["cover", "contain", "auto"] as const;

export type BackgroundSizeKeyword = (typeof BACKGROUND_SIZE_KEYWORDS)[number];

export function isBackgroundSizeKeyword(value: string): value is BackgroundSizeKeyword {
  return BACKGROUND_SIZE_KEYWORDS.includes(value as BackgroundSizeKeyword);
}
