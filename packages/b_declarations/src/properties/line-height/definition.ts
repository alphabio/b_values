// b_path:: packages/b_declarations/src/properties/line-height/definition.ts

import { defineProperty } from "../../core";
import { parseLineHeight } from "./parser";
import { generateLineHeight } from "./generator";
import type { LineHeightIR } from "./types";

export const lineHeight = defineProperty<LineHeightIR>({
  name: "line-height",
  syntax: "normal | <number [0,∞]> | <length-percentage [0,∞]> | math",
  parser: parseLineHeight,
  generator: generateLineHeight,
  inherited: true,
  initial: "normal",
});
