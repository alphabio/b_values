// b_path:: packages/b_declarations/src/properties/padding-bottom/definition.ts

import { defineProperty } from "../../core";
import { parsePaddingBottom } from "./parser";
import { generatePaddingBottom } from "./generator";
import type { PaddingBottomIR } from "./types";

export const paddingBottom = defineProperty<PaddingBottomIR>({
  name: "padding-bottom",
  syntax: "<length-percentage [0,∞]>",
  parser: parsePaddingBottom,
  generator: generatePaddingBottom,
  inherited: false,
  initial: "0",
});
