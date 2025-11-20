// b_path:: packages/b_declarations/src/properties/text-indent/definition.ts

import { defineProperty } from "../../core";
import { parseTextIndent } from "./parser";
import { generateTextIndent } from "./generator";
import type { TextIndentIR } from "./types";

export const textIndent = defineProperty<TextIndentIR>({
  name: "text-indent",
  syntax: "<length-percentage>",
  parser: parseTextIndent,
  generator: generateTextIndent,
  inherited: true,
  initial: "0",
});
