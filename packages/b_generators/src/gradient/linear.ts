// b_path:: packages/b_generators/src/gradient/linear.ts
import { generateOk, type GenerateResult, type GenerateContext } from "@b/types";
import type * as Type from "@b/types";
import * as Angle from "../angle";
import * as ColorStop from "./color-stop";

/**
 * Generate CSS direction string from GradientDirection IR.
 *
 * @param direction - GradientDirection IR object
 * @returns CSS direction string (e.g., "45deg", "to right", "to top left")
 */
function generateDirection(direction: Type.GradientDirection): GenerateResult {
  if (direction.kind === "angle") {
    return Angle.generate(direction.value);
  }

  if (direction.kind === "to-side") {
    return generateOk(`to ${direction.value}`);
  }

  return generateOk(`to ${direction.value}`);
}

/**
 * Generate CSS color interpolation method string.
 *
 * @param method - ColorInterpolationMethod IR object
 * @returns CSS interpolation string (e.g., "in oklch", "in hsl shorter hue")
 */
function generateColorInterpolation(method: Type.ColorInterpolationMethod): GenerateResult {
  let css = `in ${method.colorSpace}`;

  if ("hueInterpolationMethod" in method && method.hueInterpolationMethod) {
    css += ` ${method.hueInterpolationMethod}`;
  }

  return generateOk(css);
}

/**
 * Generate a CSS linear gradient string from intermediate representation (IR).
 *
 * Converts a LinearGradient IR object into a valid CSS `linear-gradient()` or
 * `repeating-linear-gradient()` function string.
 *
 * @param ir - LinearGradient IR object to convert to CSS
 * @returns CSS linear gradient function string
 *
 * @example
 * Simple gradient:
 * ```typescript
 * generate({
 *   kind: "linear",
 *   colorStops: [
 *     { color: { kind: "named", value: "red" } },
 *     { color: { kind: "named", value: "blue" } }
 *   ],
 *   repeating: false
 * })
 * // => "linear-gradient(red, blue)"
 * ```
 *
 * @example
 * With angle direction:
 * ```typescript
 * generate({
 *   kind: "linear",
 *   direction: { kind: "angle", value: { value: 45, unit: "deg" } },
 *   colorStops: [
 *     { color: { kind: "named", value: "red" } },
 *     { color: { kind: "named", value: "blue" } }
 *   ],
 *   repeating: false
 * })
 * // => "linear-gradient(45deg, red, blue)"
 * ```
 *
 * @example
 * With side direction:
 * ```typescript
 * generate({
 *   kind: "linear",
 *   direction: { kind: "to-side", value: "right" },
 *   colorStops: [
 *     { color: { kind: "named", value: "red" } },
 *     { color: { kind: "named", value: "blue" } }
 *   ],
 *   repeating: false
 * })
 * // => "linear-gradient(to right, red, blue)"
 * ```
 *
 * @example
 * With color interpolation:
 * ```typescript
 * generate({
 *   kind: "linear",
 *   colorSpace: "oklch",
 *   colorStops: [
 *     { color: { kind: "named", value: "red" } },
 *     { color: { kind: "named", value: "blue" } }
 *   ],
 *   repeating: false
 * })
 * // => "linear-gradient(in oklch, red, blue)"
 * ```
 */
export function generate(ir: Type.LinearGradient, context?: GenerateContext): GenerateResult {
  const functionName = ir.repeating ? "repeating-linear-gradient" : "linear-gradient";
  const parts: string[] = [];
  const allIssues: Type.Issue[] = [];

  if (ir.direction) {
    const dirResult = generateDirection(ir.direction);

    if (!dirResult.ok) return dirResult;
    parts.push(dirResult.value);
    allIssues.push(...dirResult.issues);
  }

  if (ir.colorInterpolationMethod) {
    const interpResult = generateColorInterpolation(ir.colorInterpolationMethod);
    if (!interpResult.ok) return interpResult;
    parts.push(interpResult.value);
    allIssues.push(...interpResult.issues);
  }

  for (let i = 0; i < ir.colorStops.length; i++) {
    const stop = ir.colorStops[i];
    const stopResult = ColorStop.generate(stop, {
      parentPath: [...(context?.parentPath ?? []), "colorStops", i],
      property: context?.property,
    });
    if (!stopResult.ok) return stopResult;
    parts.push(stopResult.value);
    allIssues.push(...stopResult.issues);
  }

  return {
    ok: true,
    value: `${functionName}(${parts.join(", ")})`,
    issues: allIssues,
  };
}
