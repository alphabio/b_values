// b_path:: packages/b_generators/src/gradient/color-stop.ts
import { generateOk, type GenerateResult, type GenerateContext } from "@b/types";
import type * as Type from "@b/types";
import * as Color from "../color";
import { cssValueToCss } from "@b/utils";

/**
 * Generate CSS color stop or hint string from ColorStopOrHint IR.
 *
 * A color stop consists of a color and an optional position.
 * A color hint is just a position (transition midpoint).
 * Position can be a length, percentage, or angle (for conic gradients).
 *
 * @param stopOrHint - ColorStopOrHint IR object
 * @returns CSS color stop or hint string
 *
 * @example
 * Color stops:
 * ```typescript
 * generate({ color: { kind: "named", name: "red" } })
 * // => "red"
 *
 * generate({
 *   color: { kind: "named", name: "blue" },
 *   position: { kind: "literal", value: 50, unit: "%" }
 * })
 * // => "blue 50%"
 * ```
 *
 * @example
 * Color hint:
 * ```typescript
 * generate({
 *   kind: "hint",
 *   position: { kind: "literal", value: 30, unit: "%" }
 * })
 * // => "30%"
 * ```
 */
export function generate(stopOrHint: Type.ColorStopOrHint, context?: GenerateContext): GenerateResult {
  // Handle color hint
  if ("kind" in stopOrHint && stopOrHint.kind === "hint") {
    return generateOk(cssValueToCss(stopOrHint.position));
  }

  // Handle color stop
  const colorStop = stopOrHint as Type.ColorStop;
  const colorResult = Color.generate(colorStop.color, {
    parentPath: [...(context?.parentPath ?? []), "color"],
    property: context?.property,
  });
  if (!colorResult.ok) {
    return colorResult;
  }

  let css = colorResult.value;
  const issues = [...colorResult.issues];

  if (colorStop.position) {
    const pos = colorStop.position;

    if (Array.isArray(pos)) {
      const [pos1, pos2] = pos;
      css += ` ${cssValueToCss(pos1)} ${cssValueToCss(pos2)}`;
    } else {
      css += ` ${cssValueToCss(pos)}`;
    }
  }

  return {
    ok: true,
    value: css,
    issues,
  };
}
