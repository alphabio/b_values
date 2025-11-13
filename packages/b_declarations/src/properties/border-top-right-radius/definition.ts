// b_path:: packages/b_declarations/src/properties/border-top-right-radius/definition.ts

import { defineProperty } from "../../core";
import { parseBorderTopRightRadius } from "./parser";
import { generateBorderTopRightRadius } from "./generator";
import type { BorderTopRightRadiusIR } from "./types";

export const borderTopRightRadius = defineProperty<BorderTopRightRadiusIR>({
  name: "border-top-right-radius",
  syntax: "<length-percentage [0,∞]>{1,2}",
  parser: parseBorderTopRightRadius,
  generator: generateBorderTopRightRadius,
  inherited: false,
  initial: "0",
});
