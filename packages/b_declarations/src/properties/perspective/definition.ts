// b_path:: packages/b_declarations/src/properties/perspective/definition.ts

import { defineProperty } from "../../core";
import { parsePerspective } from "./parser";
import { generatePerspective } from "./generator";
import type { PerspectiveIR } from "./types";

export const perspective = defineProperty<PerspectiveIR>({
  name: "perspective",
  syntax: "<length [0,∞]> | none",
  parser: parsePerspective,
  generator: generatePerspective,
  inherited: false,
  initial: "none",
});
