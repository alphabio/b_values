// b_path:: packages/b_utils/src/parse/color/lab.ts
import type * as csstree from "css-tree";
import { err, ok, type Result } from "@b/types";
import type { LABColor } from "@b/types";
import { parseCssValueNode, getChildren, getValues } from "@b/utils";

/**
 * Parse lab() function
 * @see https://drafts.csswg.org/css-color/#lab-colors
 */
export function parseLabFunction(node: csstree.FunctionNode): Result<LABColor, string> {
  if (node.name !== "lab") {
    return err("Expected lab() function");
  }

  const values = getValues(getChildren(node));

  if (values.length < 3 || values.length > 4) {
    return err(`LAB function must have 3 or 4 values, got ${values.length}`);
  }

  const lResult = parseCssValueNode(values[0]);
  if (!lResult.ok) return lResult;

  const aResult = parseCssValueNode(values[1]);
  if (!aResult.ok) return aResult;

  const bResult = parseCssValueNode(values[2]);
  if (!bResult.ok) return bResult;

  const lab: LABColor = {
    kind: "lab",
    l: lResult.value,
    a: aResult.value,
    b: bResult.value,
  };

  if (values.length === 4) {
    const alphaResult = parseCssValueNode(values[3]);
    if (!alphaResult.ok) return alphaResult;
    lab.alpha = alphaResult.value;
  }

  return ok(lab);
}
