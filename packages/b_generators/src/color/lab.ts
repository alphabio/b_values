// b_path:: packages/b_generators/src/color/lab.ts
import { type GenerateResult, generateErr, generateOk, labColorSchema } from "@b/types";
import { cssValueToCss, zodErrorToIssues } from "@b/utils";

/**
 * @see https://drafts.csswg.org/css-color/#lab-colors
 */
export function generate(color: unknown): GenerateResult {
  const validation = labColorSchema.safeParse(color);
  if (!validation.success) {
    return generateErr(
      zodErrorToIssues(validation.error, {
        typeName: "LABColor",
        property: "color",
      }),
      "lab-color",
    );
  }

  const { l, a, b, alpha } = validation.data;

  const labPart = `${cssValueToCss(l)} ${cssValueToCss(a)} ${cssValueToCss(b)}`;

  if (alpha !== undefined) {
    return generateOk(`lab(${labPart} / ${cssValueToCss(alpha)})`);
  }

  return generateOk(`lab(${labPart})`);
}
