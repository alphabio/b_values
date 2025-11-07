// b_path:: packages/b_parsers/src/color/color-function.ts
import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, forwardParseErr, type ParseResult } from "@b/types";
import type { ColorFunction } from "@b/types";
import { parseNodeToCssValue } from "../utils";
import { getChildren, getValues } from "@b/utils";
import * as Keywords from "@b/keywords";

/**
 * Parse color() function from css-tree AST.
 *
 * @see https://www.w3.org/TR/css-color-4/#color-function
 */
export function parseColorFunction(node: csstree.FunctionNode): ParseResult<ColorFunction> {
  if (node.name !== "color") {
    return parseErr("color", createError("invalid-syntax", "Expected color() function"));
  }

  const values = getValues(getChildren(node));

  if (values.length < 4) {
    return parseErr(
      "color",
      createError(
        "invalid-syntax",
        `color() function must have at least 4 values (space + 3 channels), got ${values.length}`,
      ),
    );
  }

  // First value must be the color space identifier
  const colorSpaceNode = values[0];
  if (!colorSpaceNode || colorSpaceNode.type !== "Identifier") {
    return parseErr(
      "color",
      createError("invalid-syntax", "color() function must start with a color space identifier"),
    );
  }

  const colorSpaceResult = Keywords.colorFunctionSpace.safeParse(colorSpaceNode.name);
  if (!colorSpaceResult.success) {
    return parseErr("color", createError("invalid-syntax", `Invalid color space: ${colorSpaceNode.name}`));
  }

  // Parse the three channel values
  const c1Result = parseNodeToCssValue(values[1]);
  if (!c1Result.ok) return forwardParseErr<ColorFunction>(c1Result);

  const c2Result = parseNodeToCssValue(values[2]);
  if (!c2Result.ok) return forwardParseErr<ColorFunction>(c2Result);

  const c3Result = parseNodeToCssValue(values[3]);
  if (!c3Result.ok) return forwardParseErr<ColorFunction>(c3Result);

  const colorFunc: ColorFunction = {
    kind: "color",
    colorSpace: colorSpaceResult.data,
    channels: [c1Result.value, c2Result.value, c3Result.value],
  };

  // Optional alpha channel (5th value after the 4 required)
  if (values.length === 5) {
    const alphaResult = parseNodeToCssValue(values[4]);
    if (!alphaResult.ok) return forwardParseErr<ColorFunction>(alphaResult);
    colorFunc.alpha = alphaResult.value;
  }

  return parseOk(colorFunc);
}
