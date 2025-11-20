// b_path:: packages/b_declarations/src/properties/backdrop-filter/definition.ts

import { defineProperty } from "../../core";
import { parseBackdropFilter } from "./parser";
import { generateBackdropFilter } from "./generator";
import type { BackdropFilterIR } from "./types";

export const backdropFilterProperty = defineProperty<BackdropFilterIR>({
  name: "backdrop-filter",
  syntax: "none | <filter-value-list>",
  parser: parseBackdropFilter,
  generator: generateBackdropFilter,
  inherited: false,
  initial: "none",
});
