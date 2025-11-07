// b_path:: packages/b_generators/src/color/hex.ts
import { type GenerateResult, generateErr, generateOk, hexColorSchema } from "@b/types";
import { zodErrorToIssues } from "@b/utils";

/**
 * @see https://drafts.csswg.org/css-color/#hex-notation
 */
export function generate(color: unknown): GenerateResult {
  // Schema validation
  const validation = hexColorSchema.safeParse(color);
  if (!validation.success) {
    return generateErr(zodErrorToIssues(validation.error, { typeName: "HexColor" }));
  }
  return generateOk(validation.data.value);
}
