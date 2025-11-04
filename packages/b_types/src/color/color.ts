// b_path:: packages/b_types/src/color/color.ts
import { z } from "zod";
import { hexColorSchema } from "./hex";
import { namedColorSchema } from "./named";
import { rgbColorSchema } from "./rgb";
import { hslColorSchema } from "./hsl";
import { hwbColorSchema } from "./hwb";
import { labColorSchema } from "./lab";
import { lchColorSchema } from "./lch";
import { oklabColorSchema } from "./oklab";
import { oklchColorSchema } from "./oklch";
import { specialColorSchema } from "./special";
import { colorFunctionSchema } from "./color-function";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
 */
export const colorSchema = z.union([
  hexColorSchema,
  namedColorSchema,
  rgbColorSchema,
  hslColorSchema,
  hwbColorSchema,
  labColorSchema,
  lchColorSchema,
  oklabColorSchema,
  oklchColorSchema,
  specialColorSchema,
  colorFunctionSchema,
]);

export type Color = z.infer<typeof colorSchema>;
