// b_path:: packages/b_declarations/src/properties/background-origin/definition.ts
import { defineProperty } from "../../core";
import { parseBackgroundOrigin } from "./parser";
import { generateBackgroundOrigin } from "./generator";
import type { BackgroundOriginIR } from "./types";

/**
 * background-origin property definition.
 */
export const backgroundOrigin = defineProperty<BackgroundOriginIR>({
  name: "background-origin",
  syntax: "<box>#",
  parser: parseBackgroundOrigin,
  multiValue: true,
  generator: generateBackgroundOrigin,
  inherited: false,
  initial: "padding-box",
});
