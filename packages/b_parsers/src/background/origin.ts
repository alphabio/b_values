// b_path:: packages/b_parsers/src/background-origin/parser.ts

import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import * as Ast from "@b/utils";

const VALID_VALUES = ["border-box", "padding-box", "content-box"] as const;
type OriginBoxValue = (typeof VALID_VALUES)[number];

/**
 * Parse a single background-origin value from a CSS AST node.
 *
 * Syntax: border-box | padding-box | content-box
 *
 * @param valueNode - The Value node containing the box value
 * @returns ParseResult with OriginBoxValue
 */
export function parseBackgroundOriginValue(valueNode: csstree.Value): ParseResult<OriginBoxValue> {
  const nodes = Ast.nodeListToArray(valueNode.children);
  const node = nodes[0];

  if (!node || !Ast.isIdentifier(node)) {
    return parseErr(createError("invalid-syntax", "Expected box value"));
  }

  const val = node.name.toLowerCase();
  if (VALID_VALUES.includes(val as OriginBoxValue)) {
    return parseOk(val as OriginBoxValue);
  }

  return parseErr(
    createError(
      "invalid-value",
      `Invalid background-origin value: '${val}'. Expected: border-box, padding-box, or content-box`,
    ),
  );
}
