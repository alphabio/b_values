// b_path:: packages/b_declarations/src/properties/font-size/definition.ts

import { defineProperty } from "../../core";
import { parseFontSize } from "./parser";
import { generateFontSize } from "./generator";
import type { FontSizeIR } from "./types";

export const fontSize = defineProperty<FontSizeIR>({
  name: "font-size",
  syntax: "<absolute-size> | <relative-size> | <length-percentage [0,∞]> | math",
  parser: parseFontSize,
  generator: generateFontSize,
  inherited: true,
  initial: "medium",
});
