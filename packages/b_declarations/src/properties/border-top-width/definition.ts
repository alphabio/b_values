// b_path:: packages/b_declarations/src/properties/border-top-width/definition.ts

import { defineProperty } from "../../core";
import { parseBorderTopWidth } from "./parser";
import { generateBorderTopWidth } from "./generator";
import type { BorderTopWidthIR } from "./types";

export const borderTopWidth = defineProperty<BorderTopWidthIR>({
  name: "border-top-width",
  syntax: "<line-width>",
  parser: parseBorderTopWidth,
  generator: generateBorderTopWidth,
  inherited: false,
  initial: "medium",
});
