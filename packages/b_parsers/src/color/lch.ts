// b_path:: packages/b_parsers/src/color/lch.ts
import type * as csstree from "css-tree";
import { err, ok, type Result } from "@b/types";
import type { LCHColor } from "@b/types";
import { parseCssValueNode, getChildren, getValues } from "@b/utils";

/**
 * Parse lch() function
 * @see https://drafts.csswg.org/css-color/#lch-colors
 */
export function parseLchFunction(node: csstree.FunctionNode): Result<LCHColor, string> {
  if (node.name !== "lch") {
    return err("Expected lch() function");
  }

  const values = getValues(getChildren(node));

  if (values.length < 3 || values.length > 4) {
    return err(`LCH function must have 3 or 4 values, got ${values.length}`);
  }

  const lResult = parseCssValueNode(values[0]);
  if (!lResult.ok) return lResult;

  const cResult = parseCssValueNode(values[1]);
  if (!cResult.ok) return cResult;

  const hResult = parseCssValueNode(values[2]);
  if (!hResult.ok) return hResult;

  const lch: LCHColor = {
    kind: "lch",
    l: lResult.value,
    c: cResult.value,
    h: hResult.value,
  };

  if (values.length === 4) {
    const alphaResult = parseCssValueNode(values[3]);
    if (!alphaResult.ok) return alphaResult;
    lch.alpha = alphaResult.value;
  }

  return ok(lch);
}
