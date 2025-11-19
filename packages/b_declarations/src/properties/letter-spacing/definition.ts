// b_path:: packages/b_declarations/src/properties/letter-spacing/definition.ts

import { defineProperty } from "../../core";
import { parseLetterSpacing } from "./parser";
import { generateLetterSpacing } from "./generator";
import type { LetterSpacingIR } from "./types";

export const letterSpacing = defineProperty<LetterSpacingIR>({
  name: "letter-spacing",
  syntax: "normal | <length>",
  parser: parseLetterSpacing,
  generator: generateLetterSpacing,
  inherited: true,
  initial: "normal",
});
