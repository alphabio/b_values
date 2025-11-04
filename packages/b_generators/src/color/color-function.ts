// b_path:: packages/b_generators/src/color/color-function.ts
import { type GenerateResult, generateErr, generateOk, createError } from "@b/types";
import type { ColorFunction } from "@b/types";

/**
 * @see https://drafts.csswg.org/css-color/#color-function
 */
export function generate(value: ColorFunction): GenerateResult {
  if (value === undefined || value === null) {
    return generateErr(createError("invalid-ir", "ColorFunction must not be null or undefined"));
  }
  if (typeof value !== "object") {
    return generateErr(createError("invalid-ir", `Expected ColorFunction object, got ${typeof value}`));
  }
  if (!("colorSpace" in value) || !("channels" in value)) {
    return generateErr(
      createError("missing-required-field", "ColorFunction must have 'colorSpace' and 'channels' fields"),
    );
  }

  const parts: string[] = ["color(", value.colorSpace];

  for (const channel of value.channels) {
    parts.push(" ");
    parts.push(channel.toFixed(6).replace(/\.?0+$/, "") || "0");
  }

  if (value.alpha !== undefined) {
    parts.push(" / ");
    parts.push(value.alpha.toFixed(6).replace(/\.?0+$/, "") || "0");
  }

  parts.push(")");
  return generateOk(parts.join(""));
}
