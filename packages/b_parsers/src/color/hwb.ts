// b_path:: packages/b_parsers/src/color/hwb.ts
import type * as csstree from "css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import type { HWBColor } from "@b/types";
import { parseCssValueNode, getChildren, getValues } from "@b/utils";

/**
 * Parse hwb() function
 * @see https://drafts.csswg.org/css-color/#the-hwb-notation
 */
export function parseHwbFunction(node: csstree.FunctionNode): ParseResult<HWBColor> {
  if (node.name !== "hwb") {
    return parseErr(createError("invalid-syntax", "Expected hwb() function"));
  }

  const values = getValues(getChildren(node));

  if (values.length < 3 || values.length > 4) {
    return parseErr(createError("invalid-syntax", `HWB function must have 3 or 4 values, got ${values.length}`));
  }

  const hResult = parseCssValueNode(values[0]);
  if (!hResult.ok) return hResult as ParseResult<HWBColor>;

  const wResult = parseCssValueNode(values[1]);
  if (!wResult.ok) return wResult as ParseResult<HWBColor>;

  const bResult = parseCssValueNode(values[2]);
  if (!bResult.ok) return bResult as ParseResult<HWBColor>;

  const hwb: HWBColor = {
    kind: "hwb",
    h: hResult.value,
    w: wResult.value,
    b: bResult.value,
  };

  if (values.length === 4) {
    const alphaResult = parseCssValueNode(values[3]);
    if (!alphaResult.ok) return alphaResult as ParseResult<HWBColor>;
    hwb.alpha = alphaResult.value;
  }

  return parseOk(hwb);
}
