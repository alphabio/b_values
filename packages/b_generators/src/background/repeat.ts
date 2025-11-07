// b_path:: packages/b_generators/src/background/repeat.ts

import { generateOk, type GenerateResult } from "@b/types";

type RepetitionValue = "repeat" | "space" | "round" | "no-repeat";

type RepeatStyle =
  | { kind: "shorthand"; value: "repeat-x" | "repeat-y" }
  | { kind: "explicit"; horizontal: RepetitionValue; vertical: RepetitionValue };

/**
 * Generate CSS string for a single background-repeat value.
 *
 * Syntax: repeat-x | repeat-y | [ repeat | space | round | no-repeat ]{1,2}
 *
 * @param style - The repeat style
 * @returns GenerateResult with CSS string
 */
export function generateBackgroundRepeatValue(style: RepeatStyle): GenerateResult {
  if (style.kind === "shorthand") {
    return generateOk(style.value);
  }

  if (style.horizontal === style.vertical) {
    return generateOk(style.horizontal);
  }

  return generateOk(`${style.horizontal} ${style.vertical}`);
}
