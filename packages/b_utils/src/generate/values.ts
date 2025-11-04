import type * as Type from "@b/types";

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
export function positionValueToCss(value: Type.PositionValue): string {
  if (typeof value === "string") {
    return value;
  }
  return lengthPercentageToCss(value);
}

/**
 * @see https://drafts.csswg.org/css-backgrounds-3/#typedef-bg-position
 */
export function position2DToCss(position: Type.Position2D): string {
  return `${positionValueToCss(position.horizontal)} ${positionValueToCss(position.vertical)}`;
}

export function joinCssValues(values: string[]): string {
  return values.join(", ");
}

export function joinCssValuesWithSpaces(values: string[]): string {
  return values.join(" ");
}
