// b_path:: packages/b_declarations/src/properties/border-right-style/definition.ts

import { defineProperty } from "../../core";
import { parseBorderRightStyle } from "./parser";
import { generateBorderRightStyle } from "./generator";
import type { BorderRightStyleIR } from "./types";

export const borderRightStyle = defineProperty<BorderRightStyleIR>({
  name: "border-right-style",
  syntax: "<line-style>",
  parser: parseBorderRightStyle,
  generator: generateBorderRightStyle,
  inherited: false,
  initial: "none",
});
