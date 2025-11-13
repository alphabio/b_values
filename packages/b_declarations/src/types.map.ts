// b_path:: packages/b_declarations/src/types.map.ts

/**
 * Map of CSS property names to their IR types.
 *
 * ⚠️ THIS FILE IS AUTO-GENERATED. DO NOT EDIT MANUALLY.
 *
 * Run: pnpm generate:definitions
 *
 * Used for type-safe parsing and generation.
 */

import type {
  BackgroundAttachmentIR,
  BackgroundBlendModeIR,
  BackgroundClipIR,
  BackgroundColorIR,
  BackgroundImageIR,
  BackgroundOriginIR,
  BackgroundPositionIR,
  BackgroundRepeatIR,
  BackgroundSizeIR,
  MixBlendModeIR,
  CustomPropertyIR,
} from "./properties";

/**
 * Map of CSS property names to their IR types.
 * Used for type-safe parsing and generation.
 */
export interface PropertyIRMap {
  "background-attachment": BackgroundAttachmentIR;
  "background-blend-mode": BackgroundBlendModeIR;
  "background-clip": BackgroundClipIR;
  "background-color": BackgroundColorIR;
  "background-image": BackgroundImageIR;
  "background-origin": BackgroundOriginIR;
  "background-position": BackgroundPositionIR;
  "background-repeat": BackgroundRepeatIR;
  "background-size": BackgroundSizeIR;
  "mix-blend-mode": MixBlendModeIR;
  [key: `--${string}`]: CustomPropertyIR;
}
