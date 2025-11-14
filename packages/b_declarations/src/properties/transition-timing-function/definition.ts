// b_path:: packages/b_declarations/src/properties/transition-timing-function/definition.ts

import { defineProperty } from "../../core";
import { parseTransitionTimingFunction } from "./parser";
import { generateTransitionTimingFunction } from "./generator";
import type { TransitionTimingFunctionIR } from "./types";

export const transitionTimingFunction = defineProperty<TransitionTimingFunctionIR>({
  name: "transition-timing-function",
  syntax: "<easing-function>#",
  parser: parseTransitionTimingFunction,
  generator: generateTransitionTimingFunction,
  inherited: false,
  initial: "ease",
});
