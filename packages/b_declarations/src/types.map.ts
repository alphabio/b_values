// b_path:: packages/b_declarations/src/types.map.ts
// This file contains the PropertyIRMap that maps property names to their IR types.
//
// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

import type {
  BackgroundAttachmentIR,
  BackgroundClipIR,
  BackgroundColorIR,
  BackgroundImageIR,
  BackgroundOriginIR,
  BackgroundPositionIR,
  BackgroundRepeatIR,
  BackgroundSizeIR,
  CustomPropertyIR,
} from "./properties";

/**
 * Map of CSS property names to their IR types.
 * Used for type-safe parsing and generation.
 */
export interface PropertyIRMap {
  "background-attachment": BackgroundAttachmentIR;
  "background-clip": BackgroundClipIR;
  "background-color": BackgroundColorIR;
  "background-image": BackgroundImageIR;
  "background-origin": BackgroundOriginIR;
  "background-position": BackgroundPositionIR;
  "background-repeat": BackgroundRepeatIR;
  "background-size": BackgroundSizeIR;
  [key: `--${string}`]: CustomPropertyIR;
}
