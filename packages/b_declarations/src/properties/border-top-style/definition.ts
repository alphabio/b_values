// b_path:: packages/b_declarations/src/properties/border-top-style/definition.ts

import { defineProperty } from "../../core";
import { parseBorderTopStyle } from "./parser";
import { generateBorderTopStyle } from "./generator";
import type { BorderTopStyleIR } from "./types";

export const borderTopStyle = defineProperty<BorderTopStyleIR>({
  name: "border-top-style",
  syntax: "<line-style>",
  parser: parseBorderTopStyle,
  generator: generateBorderTopStyle,
  inherited: false,
  initial: "none",
});
