// b_path:: packages/b_generators/src/color/oklch.ts

import { type GenerateResult, addGenerateIssue, generateErr, generateOk, oklchColorSchema } from "@b/types";
import { checkAlpha, checkHue, checkLiteralRange, collectWarnings, cssValueToCss, zodErrorToIssues } from "@b/utils";

/**
 * Semantic check for OKLCH lightness.
 *
 * Rules:
 * - If percentage: soft-bound to 0-100%.
 * - If number: soft-bound to 0-1.
 * - Otherwise (var/calc/etc): no warning.
 */
function checkOKLCHLightness(l: import("@b/types").CssValue): import("@b/types").Issue | undefined {
  if (l.kind !== "literal") return undefined;

  if (l.unit === "%") {
    // 0% – 100%
    return checkLiteralRange(l, 0, 100, { field: "l", unit: "%", typeName: "OKLCHColor" });
  }

  // Unitless or other units: treat as 0–1 soft range
  return checkLiteralRange(l, 0, 1, { field: "l", typeName: "OKLCHColor" });
}

/**
 * @see https://drafts.csswg.org/css-color/#ok-lch
 */
export function generate(color: unknown): GenerateResult {
  // 1. Schema validation (structure errors)
  const validation = oklchColorSchema.safeParse(color);
  if (!validation.success) {
    return generateErr(
      zodErrorToIssues(validation.error, {
        typeName: "OKLCHColor",
        property: "color",
      }),
      "oklch-color",
    );
  }

  const { l, c, h, alpha } = validation.data;

  // 2. Semantic validation (range warnings)
  const warnings = collectWarnings(
    // Lightness: 0-1 or 0-100% depending on unit.
    checkOKLCHLightness(l),
    // Chroma: soft-bounded guideline range (tunable).
    checkLiteralRange(c, 0, 0.4, { field: "c", typeName: "OKLCHColor" }),
    // Hue: unit and magnitude sanity.
    checkHue(h, "h", "OKLCHColor"),
    // Alpha: standard alpha semantics.
    alpha ? checkAlpha(alpha, "alpha", "OKLCHColor") : undefined,
  );

  // 3. Generate CSS
  const oklchPart = `${cssValueToCss(l)} ${cssValueToCss(c)} ${cssValueToCss(h)}`;

  let result: GenerateResult;
  if (alpha !== undefined) {
    result = generateOk(`oklch(${oklchPart} / ${cssValueToCss(alpha)})`);
  } else {
    result = generateOk(`oklch(${oklchPart})`);
  }

  // 4. Attach warnings
  for (const warning of warnings) {
    result = addGenerateIssue(result, warning);
  }

  return result;
}
