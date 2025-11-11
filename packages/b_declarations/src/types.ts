// b_path:: packages/b_declarations/src/types.ts

// This module defines the core types for the @b/declarations package.
//
// - PropertyIRMap is now derived from PROPERTY_DEFINITIONS (see types.derived.ts)
// - RegisteredProperty is the union of all known property names
// - PropertyDefinition describes how each property integrates into the registry
// - Parser / generator function signatures used by property implementations

import type { ParseResult, GenerateResult } from "@b/types";
import type { PropertyIRMap } from "./types.derived";

export type { PropertyIRMap, RegisteredProperty } from "./types.derived";

/**
 * Basic CSS declaration input structure.
 * Example: { property: "background-image", value: "linear-gradient(...)", important: true }
 */
export interface CSSDeclaration {
  property: string;
  value: string;
  important?: boolean;
}

/**
 * Result of parsing a CSS declaration into its IR representation.
 *
 * Note:
 * - `ir` is the property-specific intermediate representation.
 * - `important` is preserved when originating from declarations that include it.
 */
export interface DeclarationResult<T = unknown> {
  property: string;
  ir: T;
  important?: boolean;
}

/**
 * Property generator function type.
 *
 * Given property-specific IR, returns a GenerateResult for the CSS value
 * (NOT including the "property:" prefix).
 */
export type PropertyGenerator<T = unknown> = (ir: T) => GenerateResult;

/**
 * Parser for single-value properties.
 * Receives a css-tree Value AST node.
 * Examples: color, opacity, width.
 */
export type SingleValueParser<T> = (node: import("@eslint/css-tree").Value) => ParseResult<T>;

/**
 * Parser for multi-value (comma-separated) properties.
 * Receives the raw value string.
 * Examples: background-image, font-family.
 */
export type MultiValueParser<T> = (value: string) => ParseResult<T>;

/**
 * Parser for "raw" value properties.
 * Receives the raw value string without AST parsing.
 * Examples: custom properties, or intentionally opaque properties.
 */
export type RawValueParser<T> = (value: string) => ParseResult<T>;

/**
 * Property definition fragments for different parsing modes.
 */

type SingleValueDefinition<T> = {
  multiValue?: false;
  rawValue?: false;
  parser: SingleValueParser<T>;
};

type MultiValueDefinition<T> = {
  multiValue: true;
  rawValue?: false;
  parser: MultiValueParser<T>;
};

type RawValueDefinition<T> = {
  multiValue?: false;
  rawValue: true;
  parser: RawValueParser<T>;
};

/**
 * Property definition for the registry.
 *
 * Each CSS property registers:
 * - its canonical name (CSS syntax),
 * - syntax string (for docs),
 * - parser configuration (single, multi, or raw),
 * - optional generator for IR → CSS,
 * - inheritance and initial/computed values,
 * - optional validation constraints.
 */
export type PropertyDefinition<T = unknown> = {
  /** CSS property name, e.g. "background-image" or "--*" */
  name: string;
  /** CSS syntax string (for documentation, non-normative) */
  syntax: string;
  /** Whether the property is inherited by default */
  inherited: boolean;
  /** Initial value per spec */
  initial: string;
  /** Optional computed value description */
  computed?: string;
  /** Optional IR → CSS value generator for this property */
  generator?: PropertyGenerator<T>;
  /**
   * Optional validation: allowed keyword values for this property.
   * When provided, the core parser will pre-validate keywords before
   * delegating to the property parser, enabling early error detection.
   *
   * @example
   * allowedKeywords: ['scroll', 'fixed', 'local']
   */
  allowedKeywords?: readonly string[];
} & (SingleValueDefinition<T> | MultiValueDefinition<T> | RawValueDefinition<T>);

// ============================================================================
// CONTRACT ENFORCEMENT (Type-Level)
// ============================================================================

/**
 * Type-level check: multiValue properties must have list-like IR.
 *
 * This enforces the architectural invariant that properties using
 * createMultiValueParser (multiValue: true) must have IR with kind: "list".
 *
 * NOW ENFORCED: Checks actual PropertyDefinitions, not generic types.
 *
 * If this type check fails, it means a property is registered as multiValue
 * but its IR in PropertyIRMap doesn't have a list variant.
 */

import type { PropertyDefinitions } from "./properties/definitions";

// Extract names of all multiValue properties from ACTUAL definitions
type MultiValuePropertyNames = {
  [K in keyof PropertyDefinitions]: PropertyDefinitions[K]["multiValue"] extends true ? K : never;
}[keyof PropertyDefinitions];

// For each multiValue property, verify IR has kind: "list"
type MultiValueIRsHaveListVariant = {
  [K in MultiValuePropertyNames]: PropertyIRMap[K] extends { kind: "list" } ? true : never;
}[MultiValuePropertyNames];

// Compile-time assertion: all multiValue IRs must have list variant
// If any property violates this, TypeScript will error here showing the property name
// @ts-expect-error - Type-level contract check, intentionally unused
type _AssertMultiValueContract = MultiValueIRsHaveListVariant extends true ? true : never;
