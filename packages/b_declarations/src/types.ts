// b_path:: packages/b_declarations/src/types.ts
// This file contains the PropertyIRMap that maps property names to their IR types.
// It should be auto-generated in the future.

import type { GenerateResult } from "@b/types";
import type { BackgroundImageIR } from "./properties";

/**
 * Map of CSS property names to their IR types.
 * Used for type-safe parsing and generation.
 */
export interface PropertyIRMap {
  "background-image": BackgroundImageIR;
}

/**
 * Union type of all registered property names.
 */
export type RegisteredProperty = keyof PropertyIRMap;

/**
 * Property generator function type.
 */
export type PropertyGenerator<T = unknown> = (ir: T) => GenerateResult;
