// b_path:: packages/b_declarations/src/properties/custom-property/parser.ts
import type { ParseResult } from "@b/types";
import { createError, parseErr, parseOk } from "@b/types";
import type { CustomPropertyIR } from "./types";

/**
 * Parse custom property value
 * Stores raw string per CSS spec (no interpretation)
 * Receives raw string to preserve exact whitespace/formatting
 * @see https://www.w3.org/TR/css-variables-1/#defining-variables
 */
export function parseCustomProperty(value: string): ParseResult<CustomPropertyIR> {
  const trimmed = value.trim();
  if (trimmed === "") {
    return parseErr("MissingValue", createError("missing-value", "Custom property value cannot be empty"));
  }

  return parseOk({ kind: "raw", value: trimmed });
}
