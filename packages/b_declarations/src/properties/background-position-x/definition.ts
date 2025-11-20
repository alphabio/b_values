// b_path:: packages/b_declarations/src/properties/background-position-x/definition.ts

import { defineProperty } from "../../core";
import { parseBackgroundPositionX } from "./parser";
import { generateBackgroundPositionX } from "./generator";
import type { BackgroundPositionXIR } from "./types";

export const backgroundPositionX = defineProperty<BackgroundPositionXIR>({
  name: "background-position-x",
  syntax: "<length-percentage> | left | center | right",
  parser: parseBackgroundPositionX,
  generator: generateBackgroundPositionX,
  multiValue: true,
  inherited: false,
  initial: "0%",
});
