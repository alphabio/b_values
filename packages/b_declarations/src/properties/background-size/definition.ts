// b_path:: packages/b_declarations/src/properties/background-size/definition.ts

import { defineProperty } from "../../core/registry";
import { parseBackgroundSize } from "./parser";
import { generateBackgroundSize } from "./generator";

defineProperty({
  name: "background-size",
  syntax: "<bg-size>#",
  parser: parseBackgroundSize,
  generator: generateBackgroundSize,
  multiValue: true,
  inherited: false,
  initial: "auto",
});
