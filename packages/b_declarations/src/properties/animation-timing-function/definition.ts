// b_path:: packages/b_declarations/src/properties/animation-timing-function/definition.ts

import { defineProperty } from "../../core";
import { parseAnimationTimingFunction } from "./parser";
import { generateAnimationTimingFunction } from "./generator";
import type { AnimationTimingFunctionIR } from "./types";

export const animationTimingFunction = defineProperty<AnimationTimingFunctionIR>({
  name: "animation-timing-function",
  syntax: "<easing-function>#",
  parser: parseAnimationTimingFunction,
  generator: generateAnimationTimingFunction,
  inherited: false,
  initial: "ease",
});
