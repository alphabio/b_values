// b_path:: packages/b_declarations/src/properties/margin-bottom/definition.ts

import { defineProperty } from "../../core";
import { parseMarginBottom } from "./parser";
import { generateMarginBottom } from "./generator";
import type { MarginBottomIR } from "./types";

export const marginBottom = defineProperty<MarginBottomIR>({
  name: "margin-bottom",
  syntax: "<length-percentage> | auto",
  parser: parseMarginBottom,
  generator: generateMarginBottom,
  inherited: false,
  initial: "0",
});
