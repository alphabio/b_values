// b_path:: packages/b_parsers/src/color/lch.ts
import type * as csstree from "css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import type { LCHColor } from "@b/types";
import { parseCssValueNode, getChildren, getValues } from "@b/utils";

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

  const lResult = parseCssValueNode(values[0]);
  if (!lResult.ok) return lResult as ParseResult<LCHColor>;

  const cResult = parseCssValueNode(values[1]);
  if (!cResult.ok) return cResult as ParseResult<LCHColor>;

  const hResult = parseCssValueNode(values[2]);
  if (!hResult.ok) return hResult as ParseResult<LCHColor>;

  const lch: LCHColor = {
    kind: "lch",
    l: lResult.value,
    c: cResult.value,
    h: hResult.value,
  };

  if (values.length === 4) {
    const alphaResult = parseCssValueNode(values[3]);
    if (!alphaResult.ok) return alphaResult as ParseResult<LCHColor>;
    lch.alpha = alphaResult.value;
  }

  return parseOk(lch);
}
