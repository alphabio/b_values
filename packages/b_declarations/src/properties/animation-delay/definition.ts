// b_path:: packages/b_declarations/src/properties/animation-delay/definition.ts

import { defineProperty } from "../../core";
import { parseAnimationDelay } from "./parser";
import { generateAnimationDelay } from "./generator";
import type { AnimationDelayIR } from "./types";

export const animationDelay = defineProperty<AnimationDelayIR>({
  name: "animation-delay",
  syntax: "<time>#",
  parser: parseAnimationDelay,
  generator: generateAnimationDelay,
  inherited: false,
  initial: "0s",
});
