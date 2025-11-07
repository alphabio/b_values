// b_path:: packages/b_declarations/src/types.ts
// This file contains the PropertyIRMap that maps property names to their IR types.
// It should be auto-generated in the future.

import type { GenerateResult, ParseResult } from "@b/types";
import type { BackgroundImageIR, CustomPropertyIR } from "./properties";

/**
 * Map of CSS property names to their IR types.
 * Used for type-safe parsing and generation.
 */
export interface PropertyIRMap {
  "background-image": BackgroundImageIR;
  [key: `--${string}`]: CustomPropertyIR;
}

/**
 * Union type of all registered property names.
 */
export type RegisteredProperty = keyof PropertyIRMap;

/**
 * Property generator function type.
 */
export type PropertyGenerator<T = unknown> = (ir: T) => GenerateResult;

/**
 * Parser for single-value properties.
 * Receives a pre-parsed AST node from css-tree.
 * Example: color, opacity, width
 */
export type SingleValueParser<T> = (node: import("@eslint/css-tree").Value) => ParseResult<T>;

/**
 * Parser for multi-value (comma-separated) properties.
 * Receives the raw string value and handles splitting + partial failures.
 * Example: background-image, font-family
 */
export type MultiValueParser<T> = (value: string) => ParseResult<T>;

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
  /**
   * Parser can be either:
   * - SingleValueParser: Receives pre-parsed AST node (for single values)
   * - MultiValueParser: Receives raw string (for comma-separated lists)
   */
  parser: SingleValueParser<T> | MultiValueParser<T>;
  /**
   * Flag indicating if this property accepts multiple comma-separated values.
   * When true, parser will be called with raw string.
   * When false/undefined, parser will be called with AST node.
   */
  multiValue?: boolean;
  generator?: PropertyGenerator<T>;
  inherited: boolean;
  initial: string;
  computed?: string;
}
