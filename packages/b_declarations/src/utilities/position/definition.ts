// b_path:: packages/b_declarations/src/properties/background-position/definition.ts

import { defineProperty } from "../../core";
import { parseBackgroundPosition } from "./parser";
import { generateBackgroundPosition } from "./generator";
import type { BackgroundPositionIR } from "./types";

export const backgroundPosition = defineProperty<BackgroundPositionIR>({
  name: "background-position",
  syntax: "<bg-position>#",
  parser: parseBackgroundPosition,
  multiValue: true,
  generator: generateBackgroundPosition,
  inherited: false,
  initial: "0% 0%",
});
