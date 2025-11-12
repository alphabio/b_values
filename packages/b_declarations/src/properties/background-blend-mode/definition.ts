// b_path:: packages/b_declarations/src/properties/background-blend-mode/definition.ts

import { defineProperty } from "../../core";
import { parseBackgroundBlendMode } from "./parser";
import { generateBackgroundBlendMode } from "./generator";
import type { BackgroundBlendModeIR } from "./types";

export const backgroundBlendMode = defineProperty<BackgroundBlendModeIR>({
  name: "background-blend-mode",
  syntax: "<blend-mode>#",
  parser: parseBackgroundBlendMode,
  multiValue: true,
  generator: generateBackgroundBlendMode,
  inherited: false,
  initial: "normal",
});
