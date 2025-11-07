// b_path:: packages/b_declarations/src/properties/background-clip/types.ts

/**
 * background-clip value IR.
 * Can be a CSS-wide keyword or a list of box values.
 */
export type BackgroundClipIR = { kind: "keyword"; value: string } | { kind: "layers"; layers: BoxValue[] };

/**
 * Single box value for background-clip.
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-clip
 */
export type BoxValue = "border-box" | "padding-box" | "content-box" | "text";
