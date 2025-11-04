// b_path:: packages/b_generators/src/position.ts
import { generateOk, type GenerateResult } from "@b/types";
import type * as Type from "@b/types";

/**
 * Generate CSS position string from Position2D IR
 * @see https://drafts.csswg.org/css-backgrounds-3/#typedef-bg-position
 */
export function generate(position: Type.Position2D): GenerateResult {
  const horizontal =
    typeof position.horizontal === "string"
      ? position.horizontal
      : `${position.horizontal.value}${position.horizontal.unit}`;

  const vertical =
    typeof position.vertical === "string" ? position.vertical : `${position.vertical.value}${position.vertical.unit}`;

  return generateOk(`${horizontal} ${vertical}`);
}
