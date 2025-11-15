// b_path:: packages/b_declarations/src/properties/perspective-origin/definition.ts

import { defineProperty } from "../../core";
import { parsePerspectiveOrigin } from "./parser";
import { generatePerspectiveOrigin } from "./generator";
import type { PerspectiveOriginIR } from "./types";

export const perspectiveOrigin = defineProperty<PerspectiveOriginIR>({
  name: "perspective-origin",
  syntax: "<position>",
  parser: parsePerspectiveOrigin,
  generator: generatePerspectiveOrigin,
  inherited: false,
  initial: "50% 50%",
});
