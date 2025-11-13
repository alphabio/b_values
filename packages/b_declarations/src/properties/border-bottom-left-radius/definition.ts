// b_path:: packages/b_declarations/src/properties/border-bottom-left-radius/definition.ts

import { defineProperty } from "../../core";
import { parseBorderBottomLeftRadius } from "./parser";
import { generateBorderBottomLeftRadius } from "./generator";
import type { BorderBottomLeftRadiusIR } from "./types";

export const borderBottomLeftRadius = defineProperty<BorderBottomLeftRadiusIR>({
  name: "border-bottom-left-radius",
  syntax: "<length-percentage [0,∞]>{1,2}",
  parser: parseBorderBottomLeftRadius,
  generator: generateBorderBottomLeftRadius,
  inherited: false,
  initial: "0",
});
