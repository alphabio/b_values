// b_path:: packages/b_generators/src/position.ts
import { generateOk, type GenerateResult } from "@b/types";
import type * as Type from "@b/types";
import { cssValueToCss } from "@b/utils";

/**
 * Generate CSS position string from Position2D IR
 * @see https://drafts.csswg.org/css-backgrounds-3/#typedef-bg-position
 */
export function generate(position: Type.Position2D): GenerateResult {
  const horizontal = cssValueToCss(position.horizontal);
  const vertical = cssValueToCss(position.vertical);

  return generateOk(`${horizontal} ${vertical}`);
}
