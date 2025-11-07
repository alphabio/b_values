// b_path:: packages/b_declarations/src/properties/background-clip/definition.ts
import { defineProperty } from "../../core";
import { parseBackgroundClip } from "./parser";
import { generateBackgroundClip } from "./generator";
import type { BackgroundClipIR } from "./types";

/**
 * background-clip property definition.
 */
export const backgroundClip = defineProperty<BackgroundClipIR>({
  name: "background-clip",
  syntax: "<box>#",
  parser: parseBackgroundClip,
  multiValue: true,
  generator: generateBackgroundClip,
  inherited: false,
  initial: "border-box",
});
