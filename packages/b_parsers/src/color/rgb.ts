// b_path:: packages/b_parsers/src/color/rgb.ts
import type * as csstree from "css-tree";
import { createError, parseErr, parseOk, forwardParseErr, type ParseResult } from "@b/types";
import type { RGBColor } from "@b/types";
import { parseCssValueNodeEnhanced } from "../css-value-parser-enhanced";
import { getChildren, getValues } from "@b/utils";

/**
 * Parse rgb() or rgba() function from css-tree AST.
 *
 * @see https://drafts.csswg.org/css-color/#rgb-functions
 */
export function parseRgbFunction(node: csstree.FunctionNode): ParseResult<RGBColor> {
  if (node.name !== "rgb" && node.name !== "rgba") {
    return parseErr(createError("invalid-syntax", "Expected rgb() or rgba() function"));
  }

  const values = getValues(getChildren(node));

  if (values.length < 3 || values.length > 4) {
    return parseErr(createError("invalid-syntax", `RGB function must have 3 or 4 values, got ${values.length}`));
  }

  const rResult = parseCssValueNodeEnhanced(values[0]);
  if (!rResult.ok) return forwardParseErr<RGBColor>(rResult);

  const gResult = parseCssValueNodeEnhanced(values[1]);
  if (!gResult.ok) return forwardParseErr<RGBColor>(gResult);

  const bResult = parseCssValueNodeEnhanced(values[2]);
  if (!bResult.ok) return forwardParseErr<RGBColor>(bResult);

  const rgb: RGBColor = {
    kind: "rgb",
    r: rResult.value,
    g: gResult.value,
    b: bResult.value,
  };

  if (values.length === 4) {
    const alphaResult = parseCssValueNodeEnhanced(values[3]);
    if (!alphaResult.ok) return forwardParseErr<RGBColor>(alphaResult);
    rgb.alpha = alphaResult.value;
  }

  return parseOk(rgb);
}
