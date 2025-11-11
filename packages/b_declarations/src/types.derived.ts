// b_path:: packages/b_declarations/src/types.derived.ts

/**
 * Type derivations from PROPERTY_DEFINITIONS.
 *
 * This file derives PropertyIRMap from the actual definitions,
 * replacing the old codegen approach with type-level extraction.
 *
 * Benefits:
 * - Single source of truth (definitions.ts)
 * - No manual sync between types.map.ts and registry
 * - Type-level contracts check REAL definitions
 */

import type { PropertyDefinitions } from "./properties/definitions";
import type { PropertyDefinition } from "./types";

/**
 * Extract IR type from a PropertyDefinition.
 *
 * @example
 * ```typescript
 * type BgColorDef = PropertyDefinitions["background-color"];
 * type BgColorIR = ExtractIR<BgColorDef>;
 * // → BackgroundColorIR
 * ```
 */
export type ExtractIR<T> = T extends PropertyDefinition<infer IR> ? IR : never;

/**
 * Map of CSS property names to their IR types.
 *
 * This replaces the old auto-generated types.map.ts.
 * Derived directly from PROPERTY_DEFINITIONS via type inference.
 *
 * @example
 * ```typescript
 * type BgColorIR = PropertyIRMap["background-color"];
 * // → BackgroundColorIR (inferred from definition)
 * ```
 */
export type PropertyIRMap = {
  [K in keyof PropertyDefinitions]: ExtractIR<PropertyDefinitions[K]>;
};

/**
 * Union type of all registered property names.
 */
export type RegisteredProperty = keyof PropertyIRMap;
