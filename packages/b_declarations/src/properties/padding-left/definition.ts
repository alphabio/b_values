// b_path:: packages/b_declarations/src/properties/padding-left/definition.ts

import { defineProperty } from "../../core";
import { parsePaddingLeft } from "./parser";
import { generatePaddingLeft } from "./generator";
import type { PaddingLeftIR } from "./types";

export const paddingLeft = defineProperty<PaddingLeftIR>({
  name: "padding-left",
  syntax: "<length-percentage [0,∞]>",
  parser: parsePaddingLeft,
  generator: generatePaddingLeft,
  inherited: false,
  initial: "0",
});
