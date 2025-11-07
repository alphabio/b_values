// b_path:: packages/b_parsers/src/background-size/parser.ts

import type * as csstree from "@eslint/css-tree";
import {
  createError,
  parseErr,
  parseOk,
  forwardParseErr,
  type ParseResult,
  type SizeLayer,
  type SizeValue,
} from "@b/types";
import * as Ast from "@b/utils";
import * as Length from "../length";

/**
 * Parse a single <bg-size> value from a CSS AST node.
 *
 * Syntax: [ <length-percentage [0,∞]> | auto ]{1,2} | cover | contain
 *
 * @param valueNode - The Value node containing the bg-size
 * @returns ParseResult with SizeLayer
 */
export function parseBackgroundSizeValue(valueNode: csstree.Value): ParseResult<SizeLayer> {
  const children = Ast.nodeListToArray(valueNode.children);

  // Handle keywords: cover, contain
  if (children.length === 1 && children[0].type === "Identifier") {
    const keyword = children[0].name;
    if (keyword === "cover" || keyword === "contain") {
      return parseOk({ kind: "keyword", value: keyword });
    }
    // Single 'auto' is an explicit size
    if (keyword === "auto") {
      return parseOk({
        kind: "explicit",
        width: { kind: "auto" },
        height: { kind: "auto" },
      });
    }
  }

  // Handle explicit sizes: 1 or 2 values (width [height])
  if (children.length === 1 || children.length === 2) {
    const widthResult = parseSizeValue(children[0]);
    if (!widthResult.ok) return forwardParseErr<SizeLayer>(widthResult);

    // If only one value, apply to both width and height
    if (children.length === 1) {
      return parseOk({
        kind: "explicit",
        width: widthResult.value,
        height: widthResult.value,
      });
    }

    // Two values: width height
    const heightResult = parseSizeValue(children[1]);
    if (!heightResult.ok) return forwardParseErr<SizeLayer>(heightResult);

    return parseOk({
      kind: "explicit",
      width: widthResult.value,
      height: heightResult.value,
    });
  }

  return parseErr(createError("invalid-syntax", `Expected 1-2 size values, got ${children.length}`));
}

function parseSizeValue(node: csstree.CssNode): ParseResult<SizeValue> {
  // auto keyword
  if (node.type === "Identifier" && node.name === "auto") {
    return parseOk({ kind: "auto" });
  }

  // Length
  if (node.type === "Dimension") {
    const lengthResult = Length.parseLengthNode(node);
    if (lengthResult.ok) {
      return parseOk({ kind: "length", value: lengthResult.value });
    }
    return forwardParseErr<SizeValue>(lengthResult);
  }

  // Percentage
  if (node.type === "Percentage") {
    const value = Number(node.value);
    return parseOk({
      kind: "percentage",
      value: { value, unit: "%" },
    });
  }

  return parseErr(createError("invalid-syntax", "Expected auto, length, or percentage"));
}
