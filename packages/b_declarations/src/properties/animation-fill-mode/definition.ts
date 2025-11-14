// b_path:: packages/b_declarations/src/properties/animation-fill-mode/definition.ts

import { defineProperty } from "../../core";
import { parseAnimationFillMode } from "./parser";
import { generateAnimationFillMode } from "./generator";
import type { AnimationFillModeIR } from "./types";

export const animationFillMode = defineProperty<AnimationFillModeIR>({
  name: "animation-fill-mode",
  syntax: "none | forwards | backwards | both",
  parser: parseAnimationFillMode,
  generator: generateAnimationFillMode,
  inherited: false,
  initial: "none",
});
