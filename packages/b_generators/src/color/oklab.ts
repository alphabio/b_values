// b_path:: packages/b_generators/src/color/oklab.ts
import { type GenerateResult, generateErr, generateOk, createError, oklabColorSchema } from "@b/types";
import type { OKLabColor } from "@b/types";
import { cssValueToCss } from "@b/utils";

/**
 * @see https://drafts.csswg.org/css-color/#ok-lab
 */
export function generate(color: OKLabColor): GenerateResult {
  const validation = oklabColorSchema.safeParse(color);
  if (!validation.success) {
    const issue = validation.error.issues[0];
    return generateErr(createError("invalid-ir", `Invalid OKLabColor: ${issue?.path.join(".")}: ${issue?.message}`));
  }

  const { l, a, b, alpha } = validation.data;

  const oklabPart = `${cssValueToCss(l)} ${cssValueToCss(a)} ${cssValueToCss(b)}`;

  if (alpha !== undefined) {
    return generateOk(`oklab(${oklabPart} / ${cssValueToCss(alpha)})`);
  }

  return generateOk(`oklab(${oklabPart})`);
}
