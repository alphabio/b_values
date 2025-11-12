// b_path:: packages/b_declarations/src/properties/mix-blend-mode/definition.ts

import { defineProperty } from "../../core";
import { parseMixBlendMode } from "./parser";
import { generateMixBlendMode } from "./generator";
import type { MixBlendModeIR } from "./types";

export const mixBlendMode = defineProperty<MixBlendModeIR>({
  name: "mix-blend-mode",
  syntax: "<blend-mode>",
  parser: parseMixBlendMode,
  multiValue: false,
  generator: generateMixBlendMode,
  inherited: false,
  initial: "normal",
});
