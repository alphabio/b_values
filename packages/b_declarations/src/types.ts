// b_path:: packages/b_declarations/src/types.ts
// This file contains the PropertyIRMap that maps property names to their IR types.
// It should be auto-generated in the future.

import type { GenerateResult, ParseResult } from "@b/types";
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

// ===================================
// Moved from  ./core/types.ts
// ===================================

/**
 * A CSS declaration consists of a property name and its value.
 * Example: { property: "background-image", value: "linear-gradient(...)" }
 */
export interface CSSDeclaration {
  property: string;
  value: string;
}

/**
 * Result of parsing a CSS declaration into its IR representation.
 */
export interface DeclarationResult<T = unknown> {
  property: string;
  ir: T;
  original: string;
}

/**
 * Property definition for the registry.
 * Each CSS property must register its metadata, parser, and generator.
 */
export interface PropertyDefinition<T = unknown> {
  name: string;
  syntax: string;
  parser: (node: import("@eslint/css-tree").Value) => ParseResult<T>;
  generator?: (ir: T) => GenerateResult;
  inherited: boolean;
  initial: string;
  computed?: string;
}

/**
 * Property parser function type.
 */
export type PropertyParser<T = unknown> = (node: import("@eslint/css-tree").Value) => ParseResult<T>;

/**
 * Property generator function type (from core/types).
 */
export type CorePropertyGenerator<T = unknown> = (ir: T) => GenerateResult;
