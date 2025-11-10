// b_path:: packages/b_declarations/src/properties/background-color/definition.ts

import { defineProperty } from "../../core";
import { parseBackgroundColor } from "./parser";
import { generateBackgroundColor } from "./generator";
import type { BackgroundColorIR } from "./types";

export const backgroundColor = defineProperty<BackgroundColorIR>({
  name: "background-color",
  syntax: "<color>",
  parser: parseBackgroundColor,
  generator: generateBackgroundColor,
  inherited: false,
  initial: "transparent",
});
