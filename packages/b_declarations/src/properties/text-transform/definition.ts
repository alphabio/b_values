// b_path:: packages/b_declarations/src/properties/text-transform/definition.ts

import { defineProperty } from "../../core";
import { parseTextTransform } from "./parser";
import { generateTextTransform } from "./generator";
import type { TextTransformIR } from "./types";

export const textTransform = defineProperty<TextTransformIR>({
  name: "text-transform",
  syntax: "none | capitalize | uppercase | lowercase | full-width | full-size-kana",
  parser: parseTextTransform,
  generator: generateTextTransform,
  inherited: true,
  initial: "none",
});
