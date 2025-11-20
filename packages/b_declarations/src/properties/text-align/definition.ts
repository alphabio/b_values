// b_path:: packages/b_declarations/src/properties/text-align/definition.ts

import { defineProperty } from "../../core";
import { parseTextAlign } from "./parser";
import { generateTextAlign } from "./generator";
import type { TextAlignIR } from "./types";

export const textAlign = defineProperty<TextAlignIR>({
  name: "text-align",
  syntax: "start | end | left | right | center | justify | match-parent",
  parser: parseTextAlign,
  generator: generateTextAlign,
  inherited: true,
  initial: "start",
});
