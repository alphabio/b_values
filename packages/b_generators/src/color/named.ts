// b_path:: packages/b_generators/src/color/named.ts
import { namedColorSchema, namedColorsMap } from "@b/keywords";
import { type GenerateResult, generateOk } from "@b/types";
import type { NamedColor } from "@b/types";
import { zodErrorToIssues } from "@b/utils";
/**
 * @see https://drafts.csswg.org/css-color/#named-colors
 */
export function generate(color: NamedColor): GenerateResult {
  const validation = namedColorSchema.safeParse(color.name);

  if (!validation.success) {
    const issues = zodErrorToIssues(validation.error, {
      typeName: "NamedColor",
      property: "color",
      validKeys: namedColorsMap,
      receivedValue: color.name,
    });
    return {
      property: `color[named]: ${color.name}`,
      ok: false,
      issues,
    };
  }

  return generateOk(color.name);
}
