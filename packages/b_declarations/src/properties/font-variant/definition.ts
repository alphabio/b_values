// b_path:: packages/b_declarations/src/properties/font-variant/definition.ts

import { defineProperty } from "../../core";
import { parseFontVariant } from "./parser";
import { generateFontVariant } from "./generator";
import type { FontVariantIR } from "./types";

export const fontVariant = defineProperty<FontVariantIR>({
  name: "font-variant",
  syntax: "normal | small-caps",
  parser: parseFontVariant,
  generator: generateFontVariant,
  inherited: true,
  initial: "normal",
});
