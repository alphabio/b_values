// b_path:: packages/b_declarations/src/properties/transform/definition.ts

import { defineProperty } from "../../core";
import { parseTransform } from "./parser";
import { generateTransform } from "./generator";
import type { TransformIR } from "./types";

export const transform = defineProperty<TransformIR>({
  name: "transform",
  syntax: "none | <transform-list>",
  parser: parseTransform,
  generator: generateTransform,
  inherited: false,
  initial: "none",
});
