// b_path:: packages/b_declarations/src/properties/border-bottom-width/definition.ts

import { defineProperty } from "../../core";
import { parseBorderBottomWidth } from "./parser";
import { generateBorderBottomWidth } from "./generator";
import type { BorderBottomWidthIR } from "./types";

export const borderBottomWidth = defineProperty<BorderBottomWidthIR>({
  name: "border-bottom-width",
  syntax: "<line-width>",
  parser: parseBorderBottomWidth,
  generator: generateBorderBottomWidth,
  inherited: false,
  initial: "medium",
});
