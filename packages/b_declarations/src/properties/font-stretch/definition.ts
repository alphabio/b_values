// b_path:: packages/b_declarations/src/properties/font-stretch/definition.ts

import { defineProperty } from "../../core";
import { parseFontStretch } from "./parser";
import { generateFontStretch } from "./generator";
import type { FontStretchIR } from "./types";

export const fontStretch = defineProperty<FontStretchIR>({
  name: "font-stretch",
  syntax:
    "normal | ultra-condensed | extra-condensed | condensed | semi-condensed | semi-expanded | expanded | extra-expanded | ultra-expanded",
  parser: parseFontStretch,
  generator: generateFontStretch,
  inherited: true,
  initial: "normal",
});
