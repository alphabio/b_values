// b_path:: packages/b_declarations/src/properties/background-image/types.ts
import type { Gradient } from "@b/types";

/**
 * Background image value IR.
 * Can be a list of image layers.
 */
export type BackgroundImageIR = { kind: "keyword"; value: string } | { kind: "layers"; layers: ImageLayer[] };

/**
 * Single image layer - can be various <image> types.
 *
 * <image> =
 *   <url> |
 *   <gradient> |
 *   <image()> |
 *   <image-set()> |
 *   <cross-fade()> |
 *   <element()>
 */
export type ImageLayer = { kind: "url"; url: string } | { kind: "gradient"; gradient: Gradient } | { kind: "none" };
