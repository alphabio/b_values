// b_path:: packages/b_declarations/src/properties/animation-duration/definition.ts

import { defineProperty } from "../../core";
import { parseAnimationDuration } from "./parser";
import { generateAnimationDuration } from "./generator";
import type { AnimationDurationIR } from "./types";

export const animationDuration = defineProperty<AnimationDurationIR>({
  name: "animation-duration",
  syntax: "<time>#",
  parser: parseAnimationDuration,
  generator: generateAnimationDuration,
  inherited: false,
  initial: "0s",
});
