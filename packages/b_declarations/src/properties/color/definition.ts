// b_path:: packages/b_declarations/src/properties/color/definition.ts

import { defineProperty } from "../../core";
import { parseColor } from "./parser";
import { generateColor } from "./generator";
import type { ColorIR } from "./types";

export const color = defineProperty<ColorIR>({
  name: "color",
  syntax: "<color>",
  parser: parseColor,
  generator: generateColor,
  inherited: true,
  initial: "canvastext",
});
