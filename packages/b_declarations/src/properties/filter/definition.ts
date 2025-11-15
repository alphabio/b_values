// b_path:: packages/b_declarations/src/properties/filter/definition.ts

import { defineProperty } from "../../core";
import { parseFilter } from "./parser";
import { generateFilter } from "./generator";
import type { FilterIR } from "./types";

export const filterProperty = defineProperty<FilterIR>({
  name: "filter",
  syntax: "none | <filter-value-list>",
  parser: parseFilter,
  generator: generateFilter,
  inherited: false,
  initial: "none",
});
