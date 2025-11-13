// b_path:: packages/b_declarations/src/properties/border-top-left-radius/definition.ts

import { defineProperty } from "../../core";
import { parseBorderTopLeftRadius } from "./parser";
import { generateBorderTopLeftRadius } from "./generator";
import type { BorderTopLeftRadiusIR } from "./types";

export const borderTopLeftRadius = defineProperty<BorderTopLeftRadiusIR>({
  name: "border-top-left-radius",
  syntax: "<length-percentage [0,∞]>{1,2}",
  parser: parseBorderTopLeftRadius,
  generator: generateBorderTopLeftRadius,
  inherited: false,
  initial: "0",
});
