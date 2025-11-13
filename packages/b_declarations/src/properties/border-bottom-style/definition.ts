// b_path:: packages/b_declarations/src/properties/border-bottom-style/definition.ts

import { defineProperty } from "../../core";
import { parseBorderBottomStyle } from "./parser";
import { generateBorderBottomStyle } from "./generator";
import type { BorderBottomStyleIR } from "./types";

export const borderBottomStyle = defineProperty<BorderBottomStyleIR>({
  name: "border-bottom-style",
  syntax: "<line-style>",
  parser: parseBorderBottomStyle,
  generator: generateBorderBottomStyle,
  inherited: false,
  initial: "none",
});
