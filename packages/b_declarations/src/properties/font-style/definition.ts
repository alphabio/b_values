// b_path:: packages/b_declarations/src/properties/font-style/definition.ts

import { defineProperty } from "../../core";
import { parseFontStyle } from "./parser";
import { generateFontStyle } from "./generator";
import type { FontStyleIR } from "./types";

export const fontStyle = defineProperty<FontStyleIR>({
  name: "font-style",
  syntax: "normal | italic | oblique <angle [-90deg,90deg]>?",
  parser: parseFontStyle,
  generator: generateFontStyle,
  inherited: true,
  initial: "normal",
});
