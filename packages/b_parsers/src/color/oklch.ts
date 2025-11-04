// b_path:: packages/b_utils/src/parse/color/oklch.ts
import type * as csstree from "css-tree";
import { err, ok, type Result } from "@b/types";
import type { OKLCHColor } from "@b/types";
import { parseCssValueNode, getChildren, getValues } from "@b/utils";

/**
 * Parse oklch() function
 * @see https://drafts.csswg.org/css-color/#ok-lch
 */
export function parseOklchFunction(node: csstree.FunctionNode): Result<OKLCHColor, string> {
  if (node.name !== "oklch") {
    return err("Expected oklch() function");
  }

  const values = getValues(getChildren(node));

  if (values.length < 3 || values.length > 4) {
    return err(`OKLCH function must have 3 or 4 values, got ${values.length}`);
  }

  const lResult = parseCssValueNode(values[0]);
  if (!lResult.ok) return lResult;

  const cResult = parseCssValueNode(values[1]);
  if (!cResult.ok) return cResult;

  const hResult = parseCssValueNode(values[2]);
  if (!hResult.ok) return hResult;

  const oklch: OKLCHColor = {
    kind: "oklch",
    l: lResult.value,
    c: cResult.value,
    h: hResult.value,
  };

  if (values.length === 4) {
    const alphaResult = parseCssValueNode(values[3]);
    if (!alphaResult.ok) return alphaResult;
    oklch.alpha = alphaResult.value;
  }

  return ok(oklch);
}
