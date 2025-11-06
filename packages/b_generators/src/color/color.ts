// b_path:: packages/b_generators/src/color/color.ts
import { type GenerateResult, type GenerateContext, generateErr, generateOk, createError } from "@b/types";
import type * as Type from "@b/types";
import { cssValueToCss } from "@b/utils";
import * as ColorFunction from "./color-function";
import * as Hex from "./hex";
import * as Hsl from "./hsl";
import * as Hwb from "./hwb";
import * as Lab from "./lab";
import * as Lch from "./lch";
import * as Named from "./named";
import * as Oklab from "./oklab";
import * as Oklch from "./oklch";
import * as Rgb from "./rgb";
import * as Special from "./special";

/**
 * @see https://drafts.csswg.org/css-color/#typedef-color
 */
export function generate(color: Type.Color, context?: GenerateContext): GenerateResult {
  if (!color || typeof color !== "object" || !("kind" in color)) {
    return generateErr(
      createError("missing-required-field", "Invalid color IR: missing 'kind' field", {
        suggestion: "Ensure IR was parsed correctly",
      }),
    );
  }

  switch (color.kind) {
    case "hex":
      return Hex.generate(color);

    case "named":
      return Named.generate(color, context);

    case "rgb":
      return Rgb.generate(color, context);

    case "hsl":
      return Hsl.generate(color);

    case "hwb":
      return Hwb.generate(color);

    case "lab":
      return Lab.generate(color);

    case "lch":
      return Lch.generate(color);

    case "oklab":
      return Oklab.generate(color);

    case "oklch":
      return Oklch.generate(color);

    case "special":
      return Special.generate(color);

    case "color":
      return ColorFunction.generate(color);

    case "variable":
      // Variable can represent any color type
      return generateOk(cssValueToCss(color));

    default:
      return generateErr(
        createError("unsupported-kind", `Unknown color kind: ${(color as { kind?: string }).kind}`, {
          suggestion: "Check that color IR is valid",
        }),
      );
  }
}
