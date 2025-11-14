// b_path:: packages/b_declarations/src/properties/visibility/definition.ts

import { defineProperty } from "../../core";
import { parseVisibility } from "./parser";
import { generateVisibility } from "./generator";
import type { VisibilityIR } from "./types";

export const visibility = defineProperty<VisibilityIR>({
  name: "visibility",
  syntax: "visible | hidden | collapse",
  parser: parseVisibility,
  generator: generateVisibility,
  inherited: true,
  initial: "visible",
});
