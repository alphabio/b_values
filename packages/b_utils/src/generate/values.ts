// b_path:: packages/b_utils/src/generate/values.ts
import type * as Type from "@b/types";
import { cssValueToCss } from "./css-value";

/**
 * @see https://drafts.csswg.org/css-values-4/#lengths
 */
export function lengthToCss(length: Type.Length): string {
  return `${length.value}${length.unit}`;
}

/**
 * @see https://drafts.csswg.org/css-values-4/#percentage-value
 */
export function lengthPercentageToCss(lengthPercentage: Type.LengthPercentage): string {
  return `${lengthPercentage.value}${lengthPercentage.unit}`;
}

/**
 * @see https://drafts.csswg.org/css-values-4/#angles
 */
export function angleToCss(angle: Type.Angle): string {
  return `${angle.value}${angle.unit}`;
}

/**
 * @see https://drafts.csswg.org/css-values-4/#numbers
 */
export function numberToCss(number: number): string {
  return String(number);
}

/**
 * @see https://drafts.csswg.org/css-backgrounds-3/#typedef-bg-position
 */
export function position2DToCss(position: Type.Position2D): string {
  return `${cssValueToCss(position.horizontal)} ${cssValueToCss(position.vertical)}`;
}

export function joinCssValues(values: string[]): string {
  return values.join(", ");
}

export function joinCssValuesWithSpaces(values: string[]): string {
  return values.join(" ");
}
