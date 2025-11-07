// b_path:: packages/b_parsers/src/background/origin.ts

import type * as csstree from "@eslint/css-tree";
import { BACKGROUND_ORIGIN, type BackgroundOrigin } from "@b/keywords";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import * as Ast from "@b/utils";

/**
 * Parse a single background-origin value from a CSS AST node.
 *
 * Syntax: border-box | padding-box | content-box
 *
 * @param valueNode - The Value node containing the box value
 * @returns ParseResult with BackgroundOrigin
 */
export function parseBackgroundOriginValue(valueNode: csstree.Value): ParseResult<BackgroundOrigin> {
  const nodes = Ast.nodeListToArray(valueNode.children);
  const node = nodes[0];

  if (!node || !Ast.isIdentifier(node)) {
    return parseErr("background-origin", createError("invalid-syntax", "Expected box value"));
  }

  const val = node.name.toLowerCase();
  if (BACKGROUND_ORIGIN.includes(val as BackgroundOrigin)) {
    return parseOk(val as BackgroundOrigin);
  }

  return parseErr(
    "background-origin",
    createError(
      "invalid-value",
      `Invalid background-origin value: '${val}'. Expected: border-box, padding-box, or content-box`,
    ),
  );
}
