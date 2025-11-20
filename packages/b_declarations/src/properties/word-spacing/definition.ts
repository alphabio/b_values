// b_path:: packages/b_declarations/src/properties/word-spacing/definition.ts

import { defineProperty } from "../../core";
import { parseWordSpacing } from "./parser";
import { generateWordSpacing } from "./generator";
import type { WordSpacingIR } from "./types";

export const wordSpacing = defineProperty<WordSpacingIR>({
  name: "word-spacing",
  syntax: "normal | <length-percentage>",
  parser: parseWordSpacing,
  generator: generateWordSpacing,
  inherited: true,
  initial: "normal",
});
