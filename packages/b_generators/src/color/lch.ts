// b_path:: packages/b_generators/src/color/lch.ts
import { type GenerateResult, addGenerateIssue, generateErr, generateOk, lchColorSchema } from "@b/types";
import { checkAlpha, checkHue, checkLiteralRange, collectWarnings, cssValueToCss, zodErrorToIssues } from "@b/utils";

/**
 * Generates LCH color CSS from IR
 * Supports literals, variables (var()), and keywords (none)
 * @see https://drafts.csswg.org/css-color/#lch-colors
 */
export function generate(color: unknown): GenerateResult {
  // 1. Schema validation (structure errors)
  const validation = lchColorSchema.safeParse(color);
  if (!validation.success) {
    return generateErr(
      zodErrorToIssues(validation.error, {
        typeName: "LCHColor",
        property: "color",
      }),
      "lch-color",
    );
  }

  const { l, c, h, alpha } = validation.data;

  // 2. Semantic validation (range warnings)
  const warnings = collectWarnings(
    checkLiteralRange(l, 0, 100, { field: "l", typeName: "LCHColor" }),
    checkLiteralRange(c, 0, 150, { field: "c", typeName: "LCHColor" }),
    checkHue(h, "h", "LCHColor"),
    alpha ? checkAlpha(alpha, "alpha", "LCHColor") : undefined,
  );

  // 3. Generate CSS
  const lchPart = `${cssValueToCss(l)} ${cssValueToCss(c)} ${cssValueToCss(h)}`;

  let result: GenerateResult;
  if (alpha !== undefined) {
    result = generateOk(`lch(${lchPart} / ${cssValueToCss(alpha)})`);
  } else {
    result = generateOk(`lch(${lchPart})`);
  }

  // 4. Attach warnings
  for (const warning of warnings) {
    result = addGenerateIssue(result, warning);
  }

  return result;
}
