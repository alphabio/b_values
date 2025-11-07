// b_path:: packages/b_declarations/src/properties/background-origin/types.ts

/**
 * background-origin value IR.
 * Can be a CSS-wide keyword or a list of box values.
 */
export type BackgroundOriginIR = { kind: "keyword"; value: string } | { kind: "layers"; layers: OriginBoxValue[] };

/**
 * Single box value for background-origin.
 * Note: Unlike background-clip, text is NOT a valid value.
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-origin
 */
export type OriginBoxValue = "border-box" | "padding-box" | "content-box";
