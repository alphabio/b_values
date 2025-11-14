// b_path:: packages/b_declarations/src/properties/transform-style/definition.ts

import { defineProperty } from "../../core";
import { parseTransformStyle } from "./parser";
import { generateTransformStyle } from "./generator";
import type { TransformStyleIR } from "./types";

export const transformStyle = defineProperty<TransformStyleIR>({
  name: "transform-style",
  syntax: "flat | preserve-3d",
  parser: parseTransformStyle,
  generator: generateTransformStyle,
  inherited: false,
  initial: "flat",
});
