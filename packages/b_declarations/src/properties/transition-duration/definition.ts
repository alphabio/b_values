// b_path:: packages/b_declarations/src/properties/transition-duration/definition.ts

import { defineProperty } from "../../core";
import { parseTransitionDuration } from "./parser";
import { generateTransitionDuration } from "./generator";
import type { TransitionDurationIR } from "./types";

export const transitionDuration = defineProperty<TransitionDurationIR>({
  name: "transition-duration",
  syntax: "<time>#",
  parser: parseTransitionDuration,
  generator: generateTransitionDuration,
  inherited: false,
  initial: "0s",
});
