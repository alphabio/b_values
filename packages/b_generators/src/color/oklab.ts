// b_path:: packages/b_generators/src/color/oklab.ts
import { type GenerateResult, generateErr, generateOk, oklabColorSchema } from "@b/types";
import { cssValueToCss, zodErrorToIssues } from "@b/utils";

/**
 * @see https://drafts.csswg.org/css-color/#ok-lab
 */
export function generate(color: unknown): GenerateResult {
  const validation = oklabColorSchema.safeParse(color);
  if (!validation.success) {
    return generateErr(
      zodErrorToIssues(validation.error, {
        typeName: "OKLABColor",
        property: "color",
      }),
      "oklab-color",
    );
  }

  const { l, a, b, alpha } = validation.data;

  const oklabPart = `${cssValueToCss(l)} ${cssValueToCss(a)} ${cssValueToCss(b)}`;

  if (alpha !== undefined) {
    return generateOk(`oklab(${oklabPart} / ${cssValueToCss(alpha)})`);
  }

  return generateOk(`oklab(${oklabPart})`);
}
