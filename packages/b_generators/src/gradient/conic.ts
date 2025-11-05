// b_path:: packages/b_generators/src/gradient/conic.ts
import { generateOk, type GenerateResult } from "@b/types";
import type * as Type from "@b/types";
import * as Angle from "../angle";
import * as Position from "../position";
import * as ColorStop from "./color-stop";

/**
 * Generate CSS color interpolation method string.
 */
function generateColorInterpolation(method: Type.ColorInterpolationMethod): GenerateResult {
  let css = `in ${method.colorSpace}`;

  if ("hueInterpolationMethod" in method && method.hueInterpolationMethod) {
    css += ` ${method.hueInterpolationMethod}`;
  }

  return generateOk(css);
}

/**
 * Generate a CSS conic gradient string from intermediate representation (IR).
 *
 * Converts a ConicGradient IR object into a valid CSS `conic-gradient()` or
 * `repeating-conic-gradient()` function string.
 *
 * @param ir - ConicGradient IR object to convert to CSS
 * @returns CSS conic gradient function string
 *
 * @example
 * Simple gradient:
 * ```typescript
 * generate({
 *   kind: "conic",
 *   colorStops: [
 *     { color: { kind: "named", value: "red" } },
 *     { color: { kind: "named", value: "blue" } }
 *   ],
 *   repeating: false
 * })
 * // => "conic-gradient(red, blue)"
 * ```
 *
 * @example
 * With from angle:
 * ```typescript
 * generate({
 *   kind: "conic",
 *   fromAngle: { value: 45, unit: "deg" },
 *   colorStops: [
 *     { color: { kind: "named", value: "red" } },
 *     { color: { kind: "named", value: "blue" } }
 *   ],
 *   repeating: false
 * })
 * // => "conic-gradient(from 45deg, red, blue)"
 * ```
 *
 * @example
 * With position:
 * ```typescript
 * generate({
 *   kind: "conic",
 *   position: { horizontal: "center", vertical: "center" },
 *   colorStops: [
 *     { color: { kind: "named", value: "red" } },
 *     { color: { kind: "named", value: "blue" } }
 *   ],
 *   repeating: false
 * })
 * // => "conic-gradient(at center center, red, blue)"
 * ```
 */
export function generate(ir: Type.ConicGradient): GenerateResult {
  const functionName = ir.repeating ? "repeating-conic-gradient" : "conic-gradient";
  const parts: string[] = [];

  if (ir.fromAngle) {
    const angleResult = Angle.generate(ir.fromAngle);
    if (!angleResult.ok) return angleResult;
    parts.push(`from ${angleResult.value}`);
  }

  if (ir.position) {
    const posResult = Position.generate(ir.position);
    if (!posResult.ok) return posResult;
    parts.push(`at ${posResult.value}`);
  }

  if (ir.colorInterpolationMethod) {
    const interpResult = generateColorInterpolation(ir.colorInterpolationMethod);
    if (!interpResult.ok) return interpResult;
    parts.push(interpResult.value);
  }

  for (const stop of ir.colorStops) {
    const stopResult = ColorStop.generate(stop);
    if (!stopResult.ok) return stopResult;
    parts.push(stopResult.value);
  }

  return generateOk(`${functionName}(${parts.join(", ")})`);
}
