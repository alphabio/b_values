// b_path:: packages/b_declarations/src/properties/definitions.ts

/**
 * Central registry of all property definitions.
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
 * 1. Create property folder with definition.ts
 * 2. Import and add to PROPERTY_DEFINITIONS below
 * 3. PropertyIRMap auto-updates via type inference
 * 4. Type-level contracts validate multiValue → list IR
 */

import { backgroundAttachment } from "./background-attachment/definition";
import { backgroundClip } from "./background-clip/definition";
import { backgroundColor } from "./background-color/definition";
import { backgroundImage } from "./background-image/definition";
import { backgroundOrigin } from "./background-origin/definition";
import { backgroundPosition } from "./background-position/definition";
import { backgroundRepeat } from "./background-repeat/definition";
import { backgroundSize } from "./background-size/definition";
import { customProperty } from "./custom-property/definition";

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
  "background-attachment": backgroundAttachment,
  "background-clip": backgroundClip,
  "background-color": backgroundColor,
  "background-image": backgroundImage,
  "background-origin": backgroundOrigin,
  "background-position": backgroundPosition,
  "background-repeat": backgroundRepeat,
  "background-size": backgroundSize,
  "--*": customProperty,
} as const;

/**
 * Type alias for the definitions object.
 * Used for type-level operations.
 */
export type PropertyDefinitions = typeof PROPERTY_DEFINITIONS;
