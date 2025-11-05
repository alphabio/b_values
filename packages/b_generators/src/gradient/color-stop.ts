// b_path:: packages/b_generators/src/gradient/color-stop.ts
import { generateErr, generateOk, createError, type GenerateResult } from "@b/types";
import type * as Type from "@b/types";
import * as Color from "../color";
import * as Angle from "../angle";
import * as Length from "../length";

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
 *   position: { value: 50, unit: "%" }
 * })
 * // => "blue 50%"
 * ```
 */
export function generate(colorStop: Type.ColorStop): GenerateResult {
  const colorResult = Color.generate(colorStop.color);
  if (!colorResult.ok) {
    return colorResult;
  }

  let css = colorResult.value;
  let result = generateOk(css);

  // Propagate warnings from color
  for (const issue of colorResult.issues) {
    result = { ...result, issues: [...result.issues, issue] };
  }

  if (colorStop.position) {
    const pos = colorStop.position;

    if (Array.isArray(pos)) {
      const [pos1, pos2] = pos;
      const pos1Result = generatePosition(pos1);
      if (!pos1Result.ok) return pos1Result;

      const pos2Result = generatePosition(pos2);
      if (!pos2Result.ok) return pos2Result;

      css += ` ${pos1Result.value} ${pos2Result.value}`;
    } else {
      const posResult = generatePosition(pos);
      if (!posResult.ok) return posResult;

      css += ` ${posResult.value}`;
    }
  }

  result = { ...result, value: css };
  return result;
}

/**
 * Generate position string (length, percentage, or angle).
 */
function generatePosition(position: Type.LengthPercentage | Type.Angle): GenerateResult {
  if ("unit" in position) {
    if (position.unit === "deg" || position.unit === "grad" || position.unit === "rad" || position.unit === "turn") {
      return Angle.generate(position as Type.Angle);
    }
    return Length.generateLengthPercentage(position as Type.LengthPercentage);
  }

  return generateErr(
    createError("invalid-ir", "Invalid position in color stop", {
      suggestion: "Position must be a length, percentage, or angle",
    }),
  );
}
