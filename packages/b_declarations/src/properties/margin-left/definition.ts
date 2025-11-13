// b_path:: packages/b_declarations/src/properties/margin-left/definition.ts

import { defineProperty } from "../../core";
import { parseMarginLeft } from "./parser";
import { generateMarginLeft } from "./generator";
import type { MarginLeftIR } from "./types";

export const marginLeft = defineProperty<MarginLeftIR>({
  name: "margin-left",
  syntax: "<length-percentage> | auto",
  parser: parseMarginLeft,
  generator: generateMarginLeft,
  inherited: false,
  initial: "0",
});
