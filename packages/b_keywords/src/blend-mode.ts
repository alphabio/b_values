// b_path:: packages/b_keywords/src/blend-mode.ts

import { getLiteralValues } from "./utils";
import { z } from "zod";

/**
 * Blend mode keywords for compositing operations
 * @see https://drafts.fxtf.org/compositing/#ltblendmodegt
 */
export const blendMode = z.union([
  z.literal("normal"),
  z.literal("multiply"),
  z.literal("screen"),
  z.literal("overlay"),
  z.literal("darken"),
  z.literal("lighten"),
  z.literal("color-dodge"),
  z.literal("color-burn"),
  z.literal("hard-light"),
  z.literal("soft-light"),
  z.literal("difference"),
  z.literal("exclusion"),
  z.literal("hue"),
  z.literal("saturation"),
  z.literal("color"),
  z.literal("luminosity"),
  z.literal("plus-lighter"), // mix-blend-mode only
]);

export const BLEND_MODE = getLiteralValues(blendMode);
export type BlendMode = z.infer<typeof blendMode>;
