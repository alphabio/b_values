// b_path:: packages/b_parsers/src/color/lch.ts
import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, forwardParseErr, type ParseResult } from "@b/types";
import type { LCHColor } from "@b/types";
import { parseNodeToCssValue } from "../utils";
import { getChildren, getValues } from "@b/utils";

/**
 * Parse lch() function
 * @see https://drafts.csswg.org/css-color/#lch-colors
 */
export function parseLchFunction(node: csstree.FunctionNode): ParseResult<LCHColor> {
  if (node.name !== "lch") {
    return parseErr(createError("invalid-syntax", "Expected lch() function"));
  }

  const values = getValues(getChildren(node));

  if (values.length < 3 || values.length > 4) {
    return parseErr(createError("invalid-syntax", `LCH function must have 3 or 4 values, got ${values.length}`));
  }

  const lResult = parseNodeToCssValue(values[0]);
  if (!lResult.ok) return forwardParseErr<LCHColor>(lResult);

  const cResult = parseNodeToCssValue(values[1]);
  if (!cResult.ok) return forwardParseErr<LCHColor>(cResult);

  const hResult = parseNodeToCssValue(values[2]);
  if (!hResult.ok) return forwardParseErr<LCHColor>(hResult);

  const lch: LCHColor = {
    kind: "lch",
    l: lResult.value,
    c: cResult.value,
    h: hResult.value,
  };

  if (values.length === 4) {
    const alphaResult = parseNodeToCssValue(values[3]);
    if (!alphaResult.ok) return forwardParseErr<LCHColor>(alphaResult);
    lch.alpha = alphaResult.value;
  }

  return parseOk(lch);
}
