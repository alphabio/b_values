// b_path:: packages/b_declarations/src/properties/background-origin/definition.ts
import { defineProperty } from "../../core";
import { parseBackgroundOrigin } from "./parser";
import { generateBackgroundOrigin } from "./generator";
import type { BackgroundOriginIR } from "./types";
import { BACKGROUND_ORIGIN } from "@b/keywords";

/**
 * background-origin property definition.
 */
export const backgroundOrigin = defineProperty<BackgroundOriginIR>({
  name: "background-origin",
  syntax: "<box>#",
  allowedKeywords: BACKGROUND_ORIGIN,
  parser: parseBackgroundOrigin,
  multiValue: true,
  generator: generateBackgroundOrigin,
  inherited: false,
  initial: "padding-box",
});
