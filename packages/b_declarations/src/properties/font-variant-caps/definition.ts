// b_path:: packages/b_declarations/src/properties/font-variant-caps/definition.ts

import { defineProperty } from "../../core";
import { parseFontVariantCaps } from "./parser";
import { generateFontVariantCaps } from "./generator";
import type { FontVariantCapsIR } from "./types";

export const fontVariantCaps = defineProperty<FontVariantCapsIR>({
  name: "font-variant-caps",
  syntax: "normal | small-caps | all-small-caps | petite-caps | all-petite-caps | unicase | titling-caps",
  parser: parseFontVariantCaps,
  generator: generateFontVariantCaps,
  inherited: true,
  initial: "normal",
});
