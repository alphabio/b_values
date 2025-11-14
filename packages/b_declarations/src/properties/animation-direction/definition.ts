// b_path:: packages/b_declarations/src/properties/animation-direction/definition.ts

import { defineProperty } from "../../core";
import { parseAnimationDirection } from "./parser";
import { generateAnimationDirection } from "./generator";
import type { AnimationDirectionIR } from "./types";

export const animationDirection = defineProperty<AnimationDirectionIR>({
  name: "animation-direction",
  syntax: "normal | reverse | alternate | alternate-reverse",
  parser: parseAnimationDirection,
  generator: generateAnimationDirection,
  inherited: false,
  initial: "normal",
});
