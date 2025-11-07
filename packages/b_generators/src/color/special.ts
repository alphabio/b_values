// b_path:: packages/b_generators/src/color/special.ts
import { type GenerateResult, generateErr, generateOk, specialColorSchema } from "@b/types";
import { zodErrorToIssues } from "@b/utils";

/**
 * @see https://drafts.csswg.org/css-color/#typedef-color
 */
export function generate(color: unknown): GenerateResult {
  // Schema validation
  const validation = specialColorSchema.safeParse(color);
  if (!validation.success) {
    return generateErr(zodErrorToIssues(validation.error, { typeName: "SpecialColor" }));
  }
  return generateOk(validation.data.keyword);
}
