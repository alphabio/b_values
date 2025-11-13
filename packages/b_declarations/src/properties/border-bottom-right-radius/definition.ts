// b_path:: packages/b_declarations/src/properties/border-bottom-right-radius/definition.ts

import { defineProperty } from "../../core";
import { parseBorderBottomRightRadius } from "./parser";
import { generateBorderBottomRightRadius } from "./generator";
import type { BorderBottomRightRadiusIR } from "./types";

export const borderBottomRightRadius = defineProperty<BorderBottomRightRadiusIR>({
  name: "border-bottom-right-radius",
  syntax: "<length-percentage [0,∞]>{1,2}",
  parser: parseBorderBottomRightRadius,
  generator: generateBorderBottomRightRadius,
  inherited: false,
  initial: "0",
});
