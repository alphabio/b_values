// b_path:: packages/b_parsers/src/background-clip/parser.ts

import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import * as Ast from "@b/utils";

const VALID_VALUES = ["border-box", "padding-box", "content-box", "text"] as const;
type BoxValue = (typeof VALID_VALUES)[number];

/**
 * Parse a single background-clip value from a CSS AST node.
 *
 * Syntax: border-box | padding-box | content-box | text
 *
 * @param valueNode - The Value node containing the box value
 * @returns ParseResult with BoxValue
 */
export function parseBackgroundClipValue(valueNode: csstree.Value): ParseResult<BoxValue> {
  const nodes = Ast.nodeListToArray(valueNode.children);
  const node = nodes[0];

  if (!node || !Ast.isIdentifier(node)) {
    return parseErr(createError("invalid-syntax", "Expected box value"));
  }

  const val = node.name.toLowerCase();
  if (VALID_VALUES.includes(val as BoxValue)) {
    return parseOk(val as BoxValue);
  }

  return parseErr(
    createError(
      "invalid-value",
      `Invalid background-clip value: '${val}'. Expected: border-box, padding-box, content-box, or text`,
    ),
  );
}
