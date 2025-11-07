// b_path:: packages/b_types/src/image.ts

import { z } from "zod";
import type { Gradient } from "./gradient";

/**
 * Represents a CSS <image> value.
 *
 * CSS Spec: <image> = <url> | <gradient> | <image()> | <image-set()> | <cross-fade()> | <element()>
 *
 * Currently supported:
 * - <url> - url() function
 * - <gradient> - All gradient types (linear, radial, conic, repeating)
 *
 * Not yet supported (future):
 * - <image()> - image() function with fallbacks
 * - <image-set()> - Responsive images
 * - <cross-fade()> - Image blending
 * - <element()> - Reference to DOM element
 *
 * Note: The "none" keyword is property-specific (e.g., background-image: none)
 * and NOT part of the <image> production. Properties should handle "none" separately.
 *
 * @see https://www.w3.org/TR/css-images-3/#image-values
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/image
 */
export const imageSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("url"),
      url: z.string(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("gradient"),
      gradient: z.lazy(() => z.any()) as z.ZodType<Gradient>, // Lazy to avoid circular dependency
    })
    .strict(),
]);

export type Image = z.infer<typeof imageSchema>;
