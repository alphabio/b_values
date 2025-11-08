// b_path:: packages/b_declarations/src/properties/custom-property/definition.ts
import { defineProperty } from "../../core/registry";
import { generateCustomProperty } from "./generator";
import { parseCustomProperty } from "./parser";
import type { CustomPropertyIR } from "./types";

/**
 * Custom property definition (--*)
 * Note: This is a template - actual properties are dynamic
 * Special case in parser: receives raw string (not AST) to preserve exact formatting
 */
export const customProperty = defineProperty<CustomPropertyIR>({
  name: "--*",
  syntax: "<declaration-value>",
  parser: parseCustomProperty,
  multiValue: false,
  rawValue: true,
  generator: generateCustomProperty,
  inherited: true,
  initial: "",
});
