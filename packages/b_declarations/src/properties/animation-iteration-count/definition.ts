// b_path:: packages/b_declarations/src/properties/animation-iteration-count/definition.ts

import { defineProperty } from "../../core";
import { parseAnimationIterationCount } from "./parser";
import { generateAnimationIterationCount } from "./generator";
import type { AnimationIterationCountIR } from "./types";

export const animationIterationCount = defineProperty<AnimationIterationCountIR>({
  name: "animation-iteration-count",
  syntax: "<number> | infinite",
  parser: parseAnimationIterationCount,
  generator: generateAnimationIterationCount,
  inherited: false,
  initial: "1",
});
