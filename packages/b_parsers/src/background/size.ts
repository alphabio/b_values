// b_path:: packages/b_parsers/src/background/size.ts

import type * as csstree from "@eslint/css-tree";
import * as Keywords from "@b/keywords";
import {
  createError,
  parseErr,
  parseOk,
  forwardParseErr,
  type ParseResult,
  type BgSize,
  type CssValue,
} from "@b/types";
import * as Ast from "@b/utils";
import { parseNodeToCssValue } from "../utils/css-value-parser";

/**
 * Parse a single <bg-size> value from a CSS AST node.
 *
 * Syntax: [ <length-percentage [0,∞]> | auto ]{1,2} | cover | contain
 *
 * @param valueNode - The Value node containing the bg-size
 * @returns ParseResult with BgSize
 */
export function parseBackgroundSizeValue(valueNode: csstree.Value): ParseResult<BgSize> {
  const children = Ast.nodeListToArray(valueNode.children);

  // Handle keywords: auto, cover, contain
  if (children.length === 1 && children[0].type === "Identifier") {
    const keyword = children[0].name;
    const keywordResult = Keywords.bgSize.safeParse(keyword);
    if (keywordResult.success) {
      return parseOk({ kind: "keyword", value: keywordResult.data });
    }
    // If it's not a bg-size keyword, it's invalid
    return parseErr(
      createError(
        "invalid-syntax",
        `Invalid background-size keyword '${keyword}'. Expected 'auto', 'cover', 'contain', or a length/percentage.`,
      ),
    );
  }

  // Handle explicit sizes: 1 or 2 values (width [height])
  if (children.length === 1 || children.length === 2) {
    const widthResult = parseSizeComponent(children[0]);
    if (!widthResult.ok) return forwardParseErr<BgSize>(widthResult);

    // If only one value, apply to both width and height
    if (children.length === 1) {
      return parseOk({
        kind: "explicit",
        width: widthResult.value,
        height: widthResult.value,
      });
    }

    // Two values: width height
    const heightResult = parseSizeComponent(children[1]);
    if (!heightResult.ok) return forwardParseErr<BgSize>(heightResult);

    return parseOk({
      kind: "explicit",
      width: widthResult.value,
      height: heightResult.value,
    });
  }

  return parseErr(createError("invalid-syntax", `Expected 1-2 size values, got ${children.length}`));
}

/**
 * Parse a single size component (width or height).
 * Valid values: auto | <length-percentage> | var() | calc() etc.
 */
function parseSizeComponent(node: csstree.CssNode): ParseResult<CssValue> {
  // Use the generic parser (handles keywords like 'auto', length, percentage, var(), calc(), etc.)
  return parseNodeToCssValue(node);
}
