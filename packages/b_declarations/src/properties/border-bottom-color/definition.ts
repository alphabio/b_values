// b_path:: packages/b_declarations/src/properties/border-bottom-color/definition.ts

import { defineProperty } from "../../core";
import { parseBorderBottomColor } from "./parser";
import { generateBorderBottomColor } from "./generator";
import type { BorderBottomColorIR } from "./types";

export const borderBottomColor = defineProperty<BorderBottomColorIR>({
  name: "border-bottom-color",
  syntax: "<color>",
  parser: parseBorderBottomColor,
  generator: generateBorderBottomColor,
  inherited: false,
  initial: "currentcolor",
});
