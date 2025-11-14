// b_path:: packages/b_declarations/src/properties/transition-property/definition.ts

import { defineProperty } from "../../core";
import { parseTransitionProperty } from "./parser";
import { generateTransitionProperty } from "./generator";
import type { TransitionPropertyIR } from "./types";

export const transitionProperty = defineProperty<TransitionPropertyIR>({
  name: "transition-property",
  syntax: "none | <single-transition-property>#",
  parser: parseTransitionProperty,
  generator: generateTransitionProperty,
  inherited: false,
  initial: "all",
});
