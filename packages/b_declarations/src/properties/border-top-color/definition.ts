// b_path:: packages/b_declarations/src/properties/border-top-color/definition.ts

import { defineProperty } from "../../core";
import { parseBorderTopColor } from "./parser";
import { generateBorderTopColor } from "./generator";
import type { BorderTopColorIR } from "./types";

export const borderTopColor = defineProperty<BorderTopColorIR>({
  name: "border-top-color",
  syntax: "<color>",
  parser: parseBorderTopColor,
  generator: generateBorderTopColor,
  inherited: false,
  initial: "currentcolor",
});
