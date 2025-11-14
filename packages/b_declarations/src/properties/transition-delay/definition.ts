// b_path:: packages/b_declarations/src/properties/transition-delay/definition.ts

import { defineProperty } from "../../core";
import { parseTransitionDelay } from "./parser";
import { generateTransitionDelay } from "./generator";
import type { TransitionDelayIR } from "./types";

export const transitionDelay = defineProperty<TransitionDelayIR>({
  name: "transition-delay",
  syntax: "<time>#",
  parser: parseTransitionDelay,
  generator: generateTransitionDelay,
  inherited: false,
  initial: "0s",
});
