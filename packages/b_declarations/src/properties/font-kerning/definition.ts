// b_path:: packages/b_declarations/src/properties/font-kerning/definition.ts

import { defineProperty } from "../../core";
import { parseFontKerning } from "./parser";
import { generateFontKerning } from "./generator";
import type { FontKerningIR } from "./types";

export const fontKerning = defineProperty<FontKerningIR>({
  name: "font-kerning",
  syntax: "auto | normal | none",
  parser: parseFontKerning,
  generator: generateFontKerning,
  inherited: true,
  initial: "auto",
});
