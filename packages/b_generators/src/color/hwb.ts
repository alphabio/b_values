// b_path:: packages/b_generators/src/color/hwb.ts
import { type GenerateResult, generateErr, generateOk, hwbColorSchema } from "@b/types";
import { cssValueToCss, zodErrorToIssues } from "@b/utils";

/**
 * @see https://drafts.csswg.org/css-color/#the-hwb-notation
 */
export function generate(color: unknown): GenerateResult {
  const validation = hwbColorSchema.safeParse(color);
  if (!validation.success) {
    return generateErr(
      zodErrorToIssues(validation.error, {
        typeName: "HWBColor",
        property: "color",
      }),
      "hwb-color",
    );
  }

  const { h, w, b, alpha } = validation.data;

  let result = `hwb(${cssValueToCss(h)} ${cssValueToCss(w)} ${cssValueToCss(b)}`;

  if (alpha !== undefined) {
    result += ` / ${cssValueToCss(alpha)}`;
  }

  result += ")";
  return generateOk(result);
}
