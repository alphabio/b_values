// b_path:: packages/b_declarations/src/types.ts
import type { Result } from "@b/types";

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
 * Each CSS property must register its metadata and parser.
 */
export interface PropertyDefinition<T = unknown> {
  name: string;
  syntax: string;
  parser: (value: string) => Result<T, string>;
  inherited: boolean;
  initial: string;
  computed?: string;
}

/**
 * Property parser function type.
 */
export type PropertyParser<T = unknown> = (value: string) => Result<T, string>;
