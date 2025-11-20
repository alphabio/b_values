// b_path:: packages/b_declarations/src/properties/white-space/definition.ts

import { defineProperty } from "../../core";
import { parseWhiteSpace } from "./parser";
import { generateWhiteSpace } from "./generator";
import type { WhiteSpaceIR } from "./types";

export const whiteSpace = defineProperty<WhiteSpaceIR>({
  name: "white-space",
  syntax: "normal | pre | nowrap | pre-wrap | pre-line | break-spaces",
  parser: parseWhiteSpace,
  generator: generateWhiteSpace,
  inherited: true,
  initial: "normal",
});
