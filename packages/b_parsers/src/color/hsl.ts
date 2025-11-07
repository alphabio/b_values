// b_path:: packages/b_parsers/src/color/hsl.ts
import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, forwardParseErr, type ParseResult } from "@b/types";
import type { HSLColor } from "@b/types";
import { parseNodeToCssValue } from "../utils";
import { getChildren, getValues } from "@b/utils";

/**
 * Parse hsl() or hsla() function
 * @see https://drafts.csswg.org/css-color/#the-hsl-notation
 */
export function parseHslFunction(node: csstree.FunctionNode): ParseResult<HSLColor> {
  if (node.name !== "hsl" && node.name !== "hsla") {
    return parseErr("hsl", createError("invalid-syntax", "Expected hsl() or hsla() function"));
  }

  const values = getValues(getChildren(node));

  if (values.length < 3 || values.length > 4) {
    return parseErr("hsl", createError("invalid-syntax", `HSL function must have 3 or 4 values, got ${values.length}`));
  }

  const hResult = parseNodeToCssValue(values[0]);
  if (!hResult.ok) return forwardParseErr<HSLColor>(hResult);

  const sResult = parseNodeToCssValue(values[1]);
  if (!sResult.ok) return forwardParseErr<HSLColor>(sResult);

  const lResult = parseNodeToCssValue(values[2]);
  if (!lResult.ok) return forwardParseErr<HSLColor>(lResult);

  const hsl: HSLColor = {
    kind: "hsl",
    h: hResult.value,
    s: sResult.value,
    l: lResult.value,
  };

  if (values.length === 4) {
    const alphaResult = parseNodeToCssValue(values[3]);
    if (!alphaResult.ok) return forwardParseErr<HSLColor>(alphaResult);
    hsl.alpha = alphaResult.value;
  }

  return parseOk(hsl);
}
