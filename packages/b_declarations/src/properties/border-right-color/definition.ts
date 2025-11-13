// b_path:: packages/b_declarations/src/properties/border-right-color/definition.ts

import { defineProperty } from "../../core";
import { parseBorderRightColor } from "./parser";
import { generateBorderRightColor } from "./generator";
import type { BorderRightColorIR } from "./types";

export const borderRightColor = defineProperty<BorderRightColorIR>({
  name: "border-right-color",
  syntax: "<color>",
  parser: parseBorderRightColor,
  generator: generateBorderRightColor,
  inherited: false,
  initial: "currentcolor",
});
