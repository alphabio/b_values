// b_path:: packages/b_declarations/src/properties/border-left-color/definition.ts

import { defineProperty } from "../../core";
import { parseBorderLeftColor } from "./parser";
import { generateBorderLeftColor } from "./generator";
import type { BorderLeftColorIR } from "./types";

export const borderLeftColor = defineProperty<BorderLeftColorIR>({
  name: "border-left-color",
  syntax: "<color>",
  parser: parseBorderLeftColor,
  generator: generateBorderLeftColor,
  inherited: false,
  initial: "currentcolor",
});
