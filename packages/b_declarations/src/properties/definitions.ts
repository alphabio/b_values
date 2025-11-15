// b_path:: packages/b_declarations/src/properties/definitions.ts

/**
 * Central registry of all property definitions.
 *
 * ⚠️ THIS FILE IS AUTO-GENERATED. DO NOT EDIT MANUALLY.
 *
 * Run: pnpm generate:definitions
 *
 * This is the single source of truth for:
 * - Property names → IR type mapping (derives PropertyIRMap)
 * - Property metadata (multiValue, rawValue flags)
 * - Type-level contract enforcement
 *
 * Architecture:
 * - Each property folder exports its definition (e.g., backgroundAttachment)
 * - This file aggregates them into PROPERTY_DEFINITIONS
 * - PropertyIRMap is derived from this via type inference
 * - Type-level contracts check actual definitions, not generic types
 *
 * When adding a new property:
 * 1. Create property folder with definition.ts that exports a definition
 * 2. Run: pnpm generate:definitions
 * 3. PropertyIRMap auto-updates via type inference
 * 4. Type-level contracts validate multiValue → list IR
 */

import { customProperty } from "./custom-property/definition";
import { animationDelay } from "./animation-delay/definition";
import { animationDirection } from "./animation-direction/definition";
import { animationDuration } from "./animation-duration/definition";
import { animationFillMode } from "./animation-fill-mode/definition";
import { animationIterationCount } from "./animation-iteration-count/definition";
import { animationName } from "./animation-name/definition";
import { animationPlayState } from "./animation-play-state/definition";
import { animationTimingFunction } from "./animation-timing-function/definition";
import { backdropFilterProperty } from "./backdrop-filter/definition";
import { backgroundAttachment } from "./background-attachment/definition";
import { backgroundBlendMode } from "./background-blend-mode/definition";
import { backgroundClip } from "./background-clip/definition";
import { backgroundColor } from "./background-color/definition";
import { backgroundImage } from "./background-image/definition";
import { backgroundOrigin } from "./background-origin/definition";
import { backgroundPositionX } from "./background-position-x/definition";
import { backgroundPositionY } from "./background-position-y/definition";
import { backgroundRepeat } from "./background-repeat/definition";
import { backgroundSize } from "./background-size/definition";
import { borderBottomColor } from "./border-bottom-color/definition";
import { borderBottomLeftRadius } from "./border-bottom-left-radius/definition";
import { borderBottomRightRadius } from "./border-bottom-right-radius/definition";
import { borderBottomStyle } from "./border-bottom-style/definition";
import { borderBottomWidth } from "./border-bottom-width/definition";
import { borderLeftColor } from "./border-left-color/definition";
import { borderLeftStyle } from "./border-left-style/definition";
import { borderLeftWidth } from "./border-left-width/definition";
import { borderRightColor } from "./border-right-color/definition";
import { borderRightStyle } from "./border-right-style/definition";
import { borderRightWidth } from "./border-right-width/definition";
import { borderTopColor } from "./border-top-color/definition";
import { borderTopLeftRadius } from "./border-top-left-radius/definition";
import { borderTopRightRadius } from "./border-top-right-radius/definition";
import { borderTopStyle } from "./border-top-style/definition";
import { borderTopWidth } from "./border-top-width/definition";
import { color } from "./color/definition";
import { filterProperty } from "./filter/definition";
import { marginBottom } from "./margin-bottom/definition";
import { marginLeft } from "./margin-left/definition";
import { marginRight } from "./margin-right/definition";
import { marginTop } from "./margin-top/definition";
import { mixBlendMode } from "./mix-blend-mode/definition";
import { opacity } from "./opacity/definition";
import { paddingBottom } from "./padding-bottom/definition";
import { paddingLeft } from "./padding-left/definition";
import { paddingRight } from "./padding-right/definition";
import { paddingTop } from "./padding-top/definition";
import { perspective } from "./perspective/definition";
import { transform } from "./transform/definition";
import { transformOrigin } from "./transform-origin/definition";
import { transformStyle } from "./transform-style/definition";
import { transitionDelay } from "./transition-delay/definition";
import { transitionDuration } from "./transition-duration/definition";
import { transitionProperty } from "./transition-property/definition";
import { transitionTimingFunction } from "./transition-timing-function/definition";
import { visibility } from "./visibility/definition";

/**
 * Central definitions object.
 *
 * Keys are CSS property names (e.g., "background-color").
 * Values are PropertyDefinition instances.
 *
 * This object is the source of truth for:
 * - Runtime property lookup
 * - Type-level IR extraction
 * - Contract validation
 */
export const PROPERTY_DEFINITIONS = {
  "--*": customProperty,
  "animation-delay": animationDelay,
  "animation-direction": animationDirection,
  "animation-duration": animationDuration,
  "animation-fill-mode": animationFillMode,
  "animation-iteration-count": animationIterationCount,
  "animation-name": animationName,
  "animation-play-state": animationPlayState,
  "animation-timing-function": animationTimingFunction,
  "backdrop-filter": backdropFilterProperty,
  "background-attachment": backgroundAttachment,
  "background-blend-mode": backgroundBlendMode,
  "background-clip": backgroundClip,
  "background-color": backgroundColor,
  "background-image": backgroundImage,
  "background-origin": backgroundOrigin,
  "background-position-x": backgroundPositionX,
  "background-position-y": backgroundPositionY,
  "background-repeat": backgroundRepeat,
  "background-size": backgroundSize,
  "border-bottom-color": borderBottomColor,
  "border-bottom-left-radius": borderBottomLeftRadius,
  "border-bottom-right-radius": borderBottomRightRadius,
  "border-bottom-style": borderBottomStyle,
  "border-bottom-width": borderBottomWidth,
  "border-left-color": borderLeftColor,
  "border-left-style": borderLeftStyle,
  "border-left-width": borderLeftWidth,
  "border-right-color": borderRightColor,
  "border-right-style": borderRightStyle,
  "border-right-width": borderRightWidth,
  "border-top-color": borderTopColor,
  "border-top-left-radius": borderTopLeftRadius,
  "border-top-right-radius": borderTopRightRadius,
  "border-top-style": borderTopStyle,
  "border-top-width": borderTopWidth,
  color: color,
  filter: filterProperty,
  "margin-bottom": marginBottom,
  "margin-left": marginLeft,
  "margin-right": marginRight,
  "margin-top": marginTop,
  "mix-blend-mode": mixBlendMode,
  opacity: opacity,
  "padding-bottom": paddingBottom,
  "padding-left": paddingLeft,
  "padding-right": paddingRight,
  "padding-top": paddingTop,
  perspective: perspective,
  transform: transform,
  "transform-origin": transformOrigin,
  "transform-style": transformStyle,
  "transition-delay": transitionDelay,
  "transition-duration": transitionDuration,
  "transition-property": transitionProperty,
  "transition-timing-function": transitionTimingFunction,
  visibility: visibility,
} as const;

/**
 * Type alias for the definitions object.
 * Used for type-level operations.
 */
export type PropertyDefinitions = typeof PROPERTY_DEFINITIONS;
