// b_path:: packages/b_declarations/src/properties/font-variant-ligatures/definition.ts

import { defineProperty } from "../../core";
import { parseFontVariantLigatures } from "./parser";
import { generateFontVariantLigatures } from "./generator";
import type { FontVariantLigaturesIR } from "./types";

export const fontVariantLigatures = defineProperty<FontVariantLigaturesIR>({
  name: "font-variant-ligatures",
  syntax:
    "normal | none | [ common-ligatures | no-common-ligatures ] || [ discretionary-ligatures | no-discretionary-ligatures ] || [ historical-ligatures | no-historical-ligatures ] || [ contextual | no-contextual ]",
  parser: parseFontVariantLigatures,
  generator: generateFontVariantLigatures,
  inherited: true,
  initial: "normal",
});
