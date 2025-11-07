// b_path:: packages/b_parsers/src/color/lab.ts
import type * as csstree from "css-tree";
import { createError, parseErr, parseOk, forwardParseErr, type ParseResult } from "@b/types";
import type { LABColor } from "@b/types";
import { parseCssValueNodeWrapper } from "../css-value-parser";
import { getChildren, getValues } from "@b/utils";

/**
 * Parse lab() function
 * @see https://drafts.csswg.org/css-color/#lab-colors
 */
export function parseLabFunction(node: csstree.FunctionNode): ParseResult<LABColor> {
  if (node.name !== "lab") {
    return parseErr(createError("invalid-syntax", "Expected lab() function"));
  }

  const values = getValues(getChildren(node));

  if (values.length < 3 || values.length > 4) {
    return parseErr(createError("invalid-syntax", `LAB function must have 3 or 4 values, got ${values.length}`));
  }

  const lResult = parseCssValueNodeWrapper(values[0]);
  if (!lResult.ok) return forwardParseErr<LABColor>(lResult);

  const aResult = parseCssValueNodeWrapper(values[1]);
  if (!aResult.ok) return forwardParseErr<LABColor>(aResult);

  const bResult = parseCssValueNodeWrapper(values[2]);
  if (!bResult.ok) return forwardParseErr<LABColor>(bResult);

  const lab: LABColor = {
    kind: "lab",
    l: lResult.value,
    a: aResult.value,
    b: bResult.value,
  };

  if (values.length === 4) {
    const alphaResult = parseCssValueNodeWrapper(values[3]);
    if (!alphaResult.ok) return forwardParseErr<LABColor>(alphaResult);
    lab.alpha = alphaResult.value;
  }

  return parseOk(lab);
}
