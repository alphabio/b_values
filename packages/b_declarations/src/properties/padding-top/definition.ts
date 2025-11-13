// b_path:: packages/b_declarations/src/properties/padding-top/definition.ts

import { defineProperty } from "../../core";
import { parsePaddingTop } from "./parser";
import { generatePaddingTop } from "./generator";
import type { PaddingTopIR } from "./types";

export const paddingTop = defineProperty<PaddingTopIR>({
  name: "padding-top",
  syntax: "<length-percentage [0,∞]>",
  parser: parsePaddingTop,
  generator: generatePaddingTop,
  inherited: false,
  initial: "0",
});
