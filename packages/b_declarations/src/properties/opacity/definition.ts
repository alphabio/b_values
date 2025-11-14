// b_path:: packages/b_declarations/src/properties/opacity/definition.ts

import { defineProperty } from "../../core";
import { parseOpacity } from "./parser";
import { generateOpacity } from "./generator";
import type { OpacityIR } from "./types";

export const opacity = defineProperty<OpacityIR>({
  name: "opacity",
  syntax: "<number>",
  parser: parseOpacity,
  generator: generateOpacity,
  inherited: false,
  initial: "1",
});
