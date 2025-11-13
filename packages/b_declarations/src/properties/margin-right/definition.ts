// b_path:: packages/b_declarations/src/properties/margin-right/definition.ts

import { defineProperty } from "../../core";
import { parseMarginRight } from "./parser";
import { generateMarginRight } from "./generator";
import type { MarginRightIR } from "./types";

export const marginRight = defineProperty<MarginRightIR>({
  name: "margin-right",
  syntax: "<length-percentage> | auto",
  parser: parseMarginRight,
  generator: generateMarginRight,
  inherited: false,
  initial: "0",
});
