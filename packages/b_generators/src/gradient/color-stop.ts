// b_path:: packages/b_generators/src/gradient/color-stop.ts
import type { GenerateResult, GenerateContext } from "@b/types";
import type * as Type from "@b/types";
import * as Color from "../color";
import { cssValueToCss } from "@b/utils";

/**
 * Generate CSS color stop string from ColorStop IR.
 *
 * A color stop consists of a color and an optional position.
 * Position can be a length, percentage, or angle (for conic gradients).
 *
 * @param colorStop - ColorStop IR object
 * @returns CSS color stop string
 *
 * @example
 * ```typescript
 * generate({ color: { kind: "named", value: "red" } })
 * // => "red"
 *
 * generate({
 *   color: { kind: "named", value: "blue" },
 *   position: { kind: "literal", value: 50, unit: "%" }
 * })
 * // => "blue 50%"
 * ```
 */
export function generate(colorStop: Type.ColorStop, context?: GenerateContext): GenerateResult {
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
