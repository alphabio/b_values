// b_path:: packages/b_declarations/src/properties/margin-top/definition.ts

import { defineProperty } from "../../core";
import { parseMarginTop } from "./parser";
import { generateMarginTop } from "./generator";
import type { MarginTopIR } from "./types";

export const marginTop = defineProperty<MarginTopIR>({
  name: "margin-top",
  syntax: "<length-percentage> | auto",
  parser: parseMarginTop,
  generator: generateMarginTop,
  inherited: false,
  initial: "0",
});
