// b_path:: packages/b_declarations/src/properties/font-weight/definition.ts

import { defineProperty } from "../../core";
import { parseFontWeight } from "./parser";
import { generateFontWeight } from "./generator";
import type { FontWeightIR } from "./types";

export const fontWeight = defineProperty<FontWeightIR>({
  name: "font-weight",
  syntax: "normal | bold | bolder | lighter | <number [1,1000]>",
  parser: parseFontWeight,
  generator: generateFontWeight,
  inherited: true,
  initial: "normal",
});
