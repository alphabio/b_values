// b_path:: packages/b_generators/src/easing-function.ts
import { generateOk, type GenerateResult } from "@b/types";
import type * as Type from "@b/types";

/**
 * Generate CSS easing function string from EasingFunction IR
 * @see https://drafts.csswg.org/css-easing-1/#typedef-easing-function
 */
export function generate(easing: Type.EasingFunction): GenerateResult {
  if (easing.kind === "keyword") {
    return generateOk(easing.value);
  }

  if (easing.kind === "cubic-bezier") {
    return generateOk(`cubic-bezier(${easing.x1}, ${easing.y1}, ${easing.x2}, ${easing.y2})`);
  }

  if (easing.kind === "steps") {
    const position = easing.position ? `, ${easing.position}` : "";
    return generateOk(`steps(${easing.count}${position})`);
  }

  return generateOk("linear");
}
