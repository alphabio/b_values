// b_path:: packages/b_declarations/src/properties/transform-origin/definition.ts

import { defineProperty } from "../../core";
import { parseTransformOrigin } from "./parser";
import { generateTransformOrigin } from "./generator";
import type { TransformOriginIR } from "./types";

export const transformOrigin = defineProperty<TransformOriginIR>({
  name: "transform-origin",
  syntax: "<position>",
  parser: parseTransformOrigin,
  generator: generateTransformOrigin,
  inherited: false,
  initial: "50% 50%",
});
