// b_path:: packages/b_declarations/src/properties/border-left-style/definition.ts

import { defineProperty } from "../../core";
import { parseBorderLeftStyle } from "./parser";
import { generateBorderLeftStyle } from "./generator";
import type { BorderLeftStyleIR } from "./types";

export const borderLeftStyle = defineProperty<BorderLeftStyleIR>({
  name: "border-left-style",
  syntax: "<line-style>",
  parser: parseBorderLeftStyle,
  generator: generateBorderLeftStyle,
  inherited: false,
  initial: "none",
});
