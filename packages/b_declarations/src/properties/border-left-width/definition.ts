// b_path:: packages/b_declarations/src/properties/border-left-width/definition.ts

import { defineProperty } from "../../core";
import { parseBorderLeftWidth } from "./parser";
import { generateBorderLeftWidth } from "./generator";
import type { BorderLeftWidthIR } from "./types";

export const borderLeftWidth = defineProperty<BorderLeftWidthIR>({
  name: "border-left-width",
  syntax: "<line-width>",
  parser: parseBorderLeftWidth,
  generator: generateBorderLeftWidth,
  inherited: false,
  initial: "medium",
});
