// b_path:: packages/b_declarations/src/properties/background-size/definition.ts
// packages/b_declarations/src/properties/background-size/definition.ts

import { defineProperty } from "../../core";
import { parseBackgroundSize } from "./parser";
import { generateBackgroundSize } from "./generator";
import type { BackgroundSizeIR } from "./types";

export const backgroundSize = defineProperty<BackgroundSizeIR>({
  name: "background-size",
  syntax: "<bg-size>#",
  parser: parseBackgroundSize,
  generator: generateBackgroundSize,
  multiValue: true,
  inherited: false,
  initial: "auto",
});
