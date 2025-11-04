// b_path:: packages/b_utils/src/parse/color/oklab.ts
import type * as csstree from "css-tree";
import { err, ok, type Result } from "@b/types";
import type { OKLabColor } from "@b/types";
import { parseCssValueNode, getChildren, getValues } from "@b/utils";

/**
 * Parse oklab() function
 * @see https://drafts.csswg.org/css-color/#ok-lab
 */
export function parseOklabFunction(node: csstree.FunctionNode): Result<OKLabColor, string> {
  if (node.name !== "oklab") {
    return err("Expected oklab() function");
  }

  const values = getValues(getChildren(node));

  if (values.length < 3 || values.length > 4) {
    return err(`OKLab function must have 3 or 4 values, got ${values.length}`);
  }

  const lResult = parseCssValueNode(values[0]);
  if (!lResult.ok) return lResult;

  const aResult = parseCssValueNode(values[1]);
  if (!aResult.ok) return aResult;

  const bResult = parseCssValueNode(values[2]);
  if (!bResult.ok) return bResult;

  const oklab: OKLabColor = {
    kind: "oklab",
    l: lResult.value,
    a: aResult.value,
    b: bResult.value,
  };

  if (values.length === 4) {
    const alphaResult = parseCssValueNode(values[3]);
    if (!alphaResult.ok) return alphaResult;
    oklab.alpha = alphaResult.value;
  }

  return ok(oklab);
}
