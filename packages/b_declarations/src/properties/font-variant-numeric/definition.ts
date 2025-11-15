// b_path:: packages/b_declarations/src/properties/font-variant-numeric/definition.ts

import { defineProperty } from "../../core";
import { parseFontVariantNumeric } from "./parser";
import { generateFontVariantNumeric } from "./generator";
import type { FontVariantNumericIR } from "./types";

export const fontVariantNumeric = defineProperty<FontVariantNumericIR>({
  name: "font-variant-numeric",
  syntax:
    "normal | [ lining-nums | oldstyle-nums ] || [ proportional-nums | tabular-nums ] || [ diagonal-fractions | stacked-fractions ] || ordinal || slashed-zero",
  parser: parseFontVariantNumeric,
  generator: generateFontVariantNumeric,
  inherited: true,
  initial: "normal",
});
