// b_path:: packages/b_parsers/src/color/hsl.ts
import type * as csstree from "css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import type { HSLColor } from "@b/types";
import { parseCssValueNode, getChildren, getValues } from "@b/utils";

/**
 * Parse hsl() or hsla() function
 * @see https://drafts.csswg.org/css-color/#the-hsl-notation
 */
export function parseHslFunction(node: csstree.FunctionNode): ParseResult<HSLColor> {
  if (node.name !== "hsl" && node.name !== "hsla") {
    return parseErr(createError("invalid-syntax", "Expected hsl() or hsla() function"));
  }

  const values = getValues(getChildren(node));

  if (values.length < 3 || values.length > 4) {
    return parseErr(createError("invalid-syntax", `HSL function must have 3 or 4 values, got ${values.length}`));
  }

  const hResult = parseCssValueNode(values[0]);
  if (!hResult.ok) return hResult;

  const sResult = parseCssValueNode(values[1]);
  if (!sResult.ok) return sResult;

  const lResult = parseCssValueNode(values[2]);
  if (!lResult.ok) return lResult;

  const hsl: HSLColor = {
    kind: "hsl",
    h: hResult.value,
    s: sResult.value,
    l: lResult.value,
  };

  if (values.length === 4) {
    const alphaResult = parseCssValueNode(values[3]);
    if (!alphaResult.ok) return alphaResult;
    hsl.alpha = alphaResult.value;
  }

  return parseOk(hsl);
}
