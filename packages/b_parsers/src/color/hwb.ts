// b_path:: packages/b_parsers/src/color/hwb.ts
import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, forwardParseErr, type ParseResult } from "@b/types";
import type { HWBColor } from "@b/types";
import { parseNodeToCssValue } from "../utils";
import { getChildren, getValues } from "@b/utils";

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

  const hResult = parseNodeToCssValue(values[0]);
  if (!hResult.ok) return forwardParseErr<HWBColor>(hResult);

  const wResult = parseNodeToCssValue(values[1]);
  if (!wResult.ok) return forwardParseErr<HWBColor>(wResult);

  const bResult = parseNodeToCssValue(values[2]);
  if (!bResult.ok) return forwardParseErr<HWBColor>(bResult);

  const hwb: HWBColor = {
    kind: "hwb",
    h: hResult.value,
    w: wResult.value,
    b: bResult.value,
  };

  if (values.length === 4) {
    const alphaResult = parseNodeToCssValue(values[3]);
    if (!alphaResult.ok) return forwardParseErr<HWBColor>(alphaResult);
    hwb.alpha = alphaResult.value;
  }

  return parseOk(hwb);
}
