// b_path:: packages/b_declarations/src/properties/background-position-y/definition.ts

import { defineProperty } from "../../core";
import { parseBackgroundPositionY } from "./parser";
import { generateBackgroundPositionY } from "./generator";
import type { BackgroundPositionYIR } from "./types";

export const backgroundPositionY = defineProperty<BackgroundPositionYIR>({
  name: "background-position-y",
  syntax: "<length-percentage> | top | center | bottom",
  parser: parseBackgroundPositionY,
  generator: generateBackgroundPositionY,
  inherited: false,
  initial: "0%",
});
