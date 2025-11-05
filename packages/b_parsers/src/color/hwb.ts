// b_path:: packages/b_parsers/src/color/hwb.ts
import type * as csstree from "css-tree";
import { err, ok, type Result } from "@b/types";
import type { HWBColor } from "@b/types";
import { parseCssValueNode, getChildren, getValues } from "@b/utils";

/**
 * Parse hwb() function
 * @see https://drafts.csswg.org/css-color/#the-hwb-notation
 */
export function parseHwbFunction(node: csstree.FunctionNode): Result<HWBColor, string> {
  if (node.name !== "hwb") {
    return err("Expected hwb() function");
  }

  const values = getValues(getChildren(node));

  if (values.length < 3 || values.length > 4) {
    return err(`HWB function must have 3 or 4 values, got ${values.length}`);
  }

  const hResult = parseCssValueNode(values[0]);
  if (!hResult.ok) return hResult;

  const wResult = parseCssValueNode(values[1]);
  if (!wResult.ok) return wResult;

  const bResult = parseCssValueNode(values[2]);
  if (!bResult.ok) return bResult;

  const hwb: HWBColor = {
    kind: "hwb",
    h: hResult.value,
    w: wResult.value,
    b: bResult.value,
  };

  if (values.length === 4) {
    const alphaResult = parseCssValueNode(values[3]);
    if (!alphaResult.ok) return alphaResult;
    hwb.alpha = alphaResult.value;
  }

  return ok(hwb);
}
