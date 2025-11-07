// b_path:: packages/b_declarations/src/properties/background-image/types.ts
import type { Image } from "@b/types";

/**
 * Background image value IR.
 *
 * Property-level wrapper for the <background-image> property.
 * Supports CSS-wide keywords or a list of image layers.
 *
 * @see https://www.w3.org/TR/css-backgrounds-3/#background-image
 */
export type BackgroundImageIR = { kind: "keyword"; value: string } | { kind: "layers"; layers: ImageLayer[] };

/**
 * Single image layer for background-image property.
 *
 * Can be:
 * - <image> (url or gradient) from @b/types
 * - "none" keyword (property-specific)
 *
 * Note: "none" is property-specific and not part of the CSS <image> production.
 */
export type ImageLayer = Image | { kind: "none" };
