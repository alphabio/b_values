// b_path:: packages/b_declarations/src/properties/background-repeat/types.ts

import type { RepeatStyle } from "@b/types";

/**
 * background-repeat value IR.
 *
 * Property-level wrapper for the <background-repeat> property.
 * Supports CSS-wide keywords or a list of repeat styles.
 *
 * @see https://www.w3.org/TR/css-backgrounds-3/#background-repeat
 */
export type BackgroundRepeatIR = { kind: "keyword"; value: string } | { kind: "layers"; layers: RepeatStyle[] };
