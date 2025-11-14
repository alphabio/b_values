// b_path:: packages/b_declarations/src/properties/animation-play-state/definition.ts

import { defineProperty } from "../../core";
import { parseAnimationPlayState } from "./parser";
import { generateAnimationPlayState } from "./generator";
import type { AnimationPlayStateIR } from "./types";

export const animationPlayState = defineProperty<AnimationPlayStateIR>({
  name: "animation-play-state",
  syntax: "running | paused",
  parser: parseAnimationPlayState,
  generator: generateAnimationPlayState,
  inherited: false,
  initial: "running",
});
