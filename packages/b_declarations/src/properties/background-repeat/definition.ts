// b_path:: packages/b_declarations/src/properties/background-repeat/definition.ts
import { defineProperty } from "../../core";
import { parseBackgroundRepeat } from "./parser";
import { generateBackgroundRepeat } from "./generator";
import type { BackgroundRepeatIR } from "./types";

/**
 * background-repeat property definition.
 */
export const backgroundRepeat = defineProperty<BackgroundRepeatIR>({
  name: "background-repeat",
  syntax: "<repeat-style>#",
  parser: parseBackgroundRepeat,
  multiValue: true,
  generator: generateBackgroundRepeat,
  inherited: false,
  initial: "repeat",
});
