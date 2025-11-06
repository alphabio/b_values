// b_path:: packages/b_parsers/src/color/oklab.ts
import type * as csstree from "css-tree";
import { createError, parseErr, parseOk, forwardParseErr, type ParseResult } from "@b/types";
import type { OKLabColor } from "@b/types";
import { parseCssValueNodeEnhanced } from "../css-value-parser-enhanced";
import { getChildren, getValues } from "@b/utils";

/**
 * Parse oklab() function
 * @see https://drafts.csswg.org/css-color/#ok-lab
 */
export function parseOklabFunction(node: csstree.FunctionNode): ParseResult<OKLabColor> {
  if (node.name !== "oklab") {
    return parseErr(createError("invalid-syntax", "Expected oklab() function"));
  }

  const values = getValues(getChildren(node));

  if (values.length < 3 || values.length > 4) {
    return parseErr(createError("invalid-syntax", `OKLab function must have 3 or 4 values, got ${values.length}`));
  }

  const lResult = parseCssValueNodeEnhanced(values[0]);
  if (!lResult.ok) return forwardParseErr<OKLabColor>(lResult);

  const aResult = parseCssValueNodeEnhanced(values[1]);
  if (!aResult.ok) return forwardParseErr<OKLabColor>(aResult);

  const bResult = parseCssValueNodeEnhanced(values[2]);
  if (!bResult.ok) return forwardParseErr<OKLabColor>(bResult);

  const oklab: OKLabColor = {
    kind: "oklab",
    l: lResult.value,
    a: aResult.value,
    b: bResult.value,
  };

  if (values.length === 4) {
    const alphaResult = parseCssValueNodeEnhanced(values[3]);
    if (!alphaResult.ok) return forwardParseErr<OKLabColor>(alphaResult);
    oklab.alpha = alphaResult.value;
  }

  return parseOk(oklab);
}
