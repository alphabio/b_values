// b_path:: packages/b_declarations/src/properties/background-repeat/types.ts

/**
 * background-repeat value IR.
 * Can be a CSS-wide keyword or a list of repeat styles.
 */
export type BackgroundRepeatIR = { kind: "keyword"; value: string } | { kind: "layers"; layers: RepeatStyle[] };

/**
 * Single repeat style - can be shorthand or explicit form.
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-repeat
 */
export type RepeatStyle =
  | { kind: "shorthand"; value: "repeat-x" | "repeat-y" }
  | { kind: "explicit"; horizontal: RepetitionValue; vertical: RepetitionValue };

/**
 * Single repetition value for explicit form.
 */
export type RepetitionValue = "repeat" | "space" | "round" | "no-repeat";
