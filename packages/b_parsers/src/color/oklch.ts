// b_path:: packages/b_parsers/src/color/oklch.ts
import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, forwardParseErr, type ParseResult } from "@b/types";
import type { OKLCHColor } from "@b/types";
import { parseNodeToCssValue } from "../css-value-parser";
import { getChildren, getValues } from "@b/utils";

/**
 * Parse oklch() function
 * @see https://drafts.csswg.org/css-color/#ok-lch
 */
export function parseOklchFunction(node: csstree.FunctionNode): ParseResult<OKLCHColor> {
  if (node.name !== "oklch") {
    return parseErr(createError("invalid-syntax", "Expected oklch() function"));
  }

  const values = getValues(getChildren(node));

  if (values.length < 3 || values.length > 4) {
    return parseErr(createError("invalid-syntax", `OKLCH function must have 3 or 4 values, got ${values.length}`));
  }

  const lResult = parseNodeToCssValue(values[0]);
  if (!lResult.ok) return forwardParseErr<OKLCHColor>(lResult);

  const cResult = parseNodeToCssValue(values[1]);
  if (!cResult.ok) return forwardParseErr<OKLCHColor>(cResult);

  const hResult = parseNodeToCssValue(values[2]);
  if (!hResult.ok) return forwardParseErr<OKLCHColor>(hResult);

  const oklch: OKLCHColor = {
    kind: "oklch",
    l: lResult.value,
    c: cResult.value,
    h: hResult.value,
  };

  if (values.length === 4) {
    const alphaResult = parseNodeToCssValue(values[3]);
    if (!alphaResult.ok) return forwardParseErr<OKLCHColor>(alphaResult);
    oklch.alpha = alphaResult.value;
  }

  return parseOk(oklch);
}
