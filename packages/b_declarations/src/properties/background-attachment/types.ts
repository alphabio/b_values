// b_path:: packages/b_declarations/src/properties/background-attachment/types.ts

/**
 * background-attachment value IR.
 * Can be a CSS-wide keyword or a list of attachment values.
 */
export type BackgroundAttachmentIR = { kind: "keyword"; value: string } | { kind: "layers"; layers: AttachmentValue[] };

/**
 * Single attachment value.
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-attachment
 */
export type AttachmentValue = "scroll" | "fixed" | "local";
