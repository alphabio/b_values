// b_path:: packages/b_generators/src/gradient/radial.ts
import { generateOk, type GenerateResult } from "@b/types";
import type * as Type from "@b/types";
import * as Position from "../position";
import * as Length from "../length";
import * as ColorStop from "./color-stop";

/**
 * Generate CSS radial gradient size string from RadialGradientSize IR.
 *
 * @param size - RadialGradientSize IR object
 * @returns CSS size string
 */
function generateSize(size: Type.RadialGradientSize): GenerateResult {
  if (size.kind === "keyword") {
    return generateOk(size.value);
  }

  if (size.kind === "circle-explicit") {
    const radiusResult = Length.generateLengthPercentage(size.radius);
    if (!radiusResult.ok) return radiusResult;
    return generateOk(radiusResult.value);
  }

  const rxResult = Length.generateLengthPercentage(size.radiusX);
  if (!rxResult.ok) return rxResult;

  const ryResult = Length.generateLengthPercentage(size.radiusY);
  if (!ryResult.ok) return ryResult;

  return generateOk(`${rxResult.value} ${ryResult.value}`);
}

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
 * Generate a CSS radial gradient string from intermediate representation (IR).
 *
 * Converts a RadialGradient IR object into a valid CSS `radial-gradient()` or
 * `repeating-radial-gradient()` function string.
 *
 * @param ir - RadialGradient IR object to convert to CSS
 * @returns CSS radial gradient function string
 *
 * @example
 * Simple gradient:
 * ```typescript
 * generate({
 *   kind: "radial",
 *   colorStops: [
 *     { color: { kind: "named", value: "red" } },
 *     { color: { kind: "named", value: "blue" } }
 *   ],
 *   repeating: false
 * })
 * // => "radial-gradient(red, blue)"
 * ```
 *
 * @example
 * With shape and size:
 * ```typescript
 * generate({
 *   kind: "radial",
 *   shape: "circle",
 *   size: { kind: "keyword", value: "closest-side" },
 *   colorStops: [
 *     { color: { kind: "named", value: "red" } },
 *     { color: { kind: "named", value: "blue" } }
 *   ],
 *   repeating: false
 * })
 * // => "radial-gradient(circle closest-side, red, blue)"
 * ```
 *
 * @example
 * With position:
 * ```typescript
 * generate({
 *   kind: "radial",
 *   position: { horizontal: "center", vertical: "top" },
 *   colorStops: [
 *     { color: { kind: "named", value: "red" } },
 *     { color: { kind: "named", value: "blue" } }
 *   ],
 *   repeating: false
 * })
 * // => "radial-gradient(at center top, red, blue)"
 * ```
 */
export function generate(ir: Type.RadialGradient): GenerateResult {
  const functionName = ir.repeating ? "repeating-radial-gradient" : "radial-gradient";
  const parts: string[] = [];
  const firstPart: string[] = [];

  if (ir.shape) {
    firstPart.push(ir.shape);
  }

  if (ir.size) {
    const sizeResult = generateSize(ir.size);
    if (!sizeResult.ok) return sizeResult;
    firstPart.push(sizeResult.value);
  }

  if (ir.position) {
    const posResult = Position.generate(ir.position);
    if (!posResult.ok) return posResult;
    firstPart.push(`at ${posResult.value}`);
  }

  if (firstPart.length > 0) {
    parts.push(firstPart.join(" "));
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
