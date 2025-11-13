// b_path:: packages/b_declarations/src/properties/padding-right/definition.ts

import { defineProperty } from "../../core";
import { parsePaddingRight } from "./parser";
import { generatePaddingRight } from "./generator";
import type { PaddingRightIR } from "./types";

export const paddingRight = defineProperty<PaddingRightIR>({
  name: "padding-right",
  syntax: "<length-percentage [0,∞]>",
  parser: parsePaddingRight,
  generator: generatePaddingRight,
  inherited: false,
  initial: "0",
});
