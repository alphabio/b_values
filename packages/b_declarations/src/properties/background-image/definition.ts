// b_path:: packages/b_declarations/src/properties/background-image/definition.ts
import { defineProperty } from "../../core";
import { parseBackgroundImage } from "./parser";
import { generateBackgroundImage } from "./generator";
import type { BackgroundImageIR } from "./types";

/**
 * background-image property definition.
 */
export const backgroundImage = defineProperty<BackgroundImageIR>({
  name: "background-image",
  syntax: "<bg-image>#",
  parser: parseBackgroundImage,
  generator: generateBackgroundImage,
  inherited: false,
  initial: "none",
});
