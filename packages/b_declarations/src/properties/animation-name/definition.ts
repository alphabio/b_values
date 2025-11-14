// b_path:: packages/b_declarations/src/properties/animation-name/definition.ts

import { defineProperty } from "../../core";
import { parseAnimationName } from "./parser";
import { generateAnimationName } from "./generator";
import type { AnimationNameIR } from "./types";

export const animationName = defineProperty<AnimationNameIR>({
  name: "animation-name",
  syntax: "[ none | <keyframes-name> ]#",
  parser: parseAnimationName,
  generator: generateAnimationName,
  inherited: false,
  initial: "none",
});
