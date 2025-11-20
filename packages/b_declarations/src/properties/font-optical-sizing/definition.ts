// b_path:: packages/b_declarations/src/properties/font-optical-sizing/definition.ts

import { defineProperty } from "../../core";
import { parseFontOpticalSizing } from "./parser";
import { generateFontOpticalSizing } from "./generator";
import type { FontOpticalSizingIR } from "./types";

export const fontOpticalSizing = defineProperty<FontOpticalSizingIR>({
  name: "font-optical-sizing",
  syntax: "auto | none",
  parser: parseFontOpticalSizing,
  generator: generateFontOpticalSizing,
  inherited: true,
  initial: "auto",
});
