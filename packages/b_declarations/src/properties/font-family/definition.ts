// b_path:: packages/b_declarations/src/properties/font-family/definition.ts

import { defineProperty } from "../../core";
import { parseFontFamily } from "./parser";
import { generateFontFamily } from "./generator";
import type { FontFamilyIR } from "./types";

export const fontFamily = defineProperty<FontFamilyIR>({
  name: "font-family",
  syntax: "[ <family-name> | <generic-family> ]#",
  parser: parseFontFamily,
  generator: generateFontFamily,
  inherited: true,
  initial: "serif",
});
