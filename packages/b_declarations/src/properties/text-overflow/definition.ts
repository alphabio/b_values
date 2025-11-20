// b_path:: packages/b_declarations/src/properties/text-overflow/definition.ts

import { defineProperty } from "../../core";
import { parseTextOverflow } from "./parser";
import { generateTextOverflow } from "./generator";
import type { TextOverflowIR } from "./types";

export const textOverflow = defineProperty<TextOverflowIR>({
  name: "text-overflow",
  syntax: "clip | ellipsis",
  parser: parseTextOverflow,
  generator: generateTextOverflow,
  inherited: false,
  initial: "clip",
});
