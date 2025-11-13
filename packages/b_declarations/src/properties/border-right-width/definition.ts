// b_path:: packages/b_declarations/src/properties/border-right-width/definition.ts

import { defineProperty } from "../../core";
import { parseBorderRightWidth } from "./parser";
import { generateBorderRightWidth } from "./generator";
import type { BorderRightWidthIR } from "./types";

export const borderRightWidth = defineProperty<BorderRightWidthIR>({
  name: "border-right-width",
  syntax: "<line-width>",
  parser: parseBorderRightWidth,
  generator: generateBorderRightWidth,
  inherited: false,
  initial: "medium",
});
