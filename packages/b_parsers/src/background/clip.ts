// b_path:: packages/b_parsers/src/background/clip.ts

import type * as csstree from "@eslint/css-tree";
import { BACKGROUND_CLIP, type BackgroundClip } from "@b/keywords";
import { createError, parseErr, parseOk, type ParseResult, type CssValue } from "@b/types";
import * as Ast from "@b/utils";
import { parseNodeToCssValue } from "../utils/css-value-parser";

/**
 * Parse a single background-clip value from a CSS AST node.
 *
 * Syntax: border-box | padding-box | content-box | text | <var()> | <calc()>
 *
 * @param valueNode - The Value node containing the box value
 * @returns ParseResult with CssValue (keyword, var(), calc(), etc.)
 */
export function parseBackgroundClipValue(valueNode: csstree.Value): ParseResult<CssValue> {
  const nodes = Ast.nodeListToArray(valueNode.children);
  const node = nodes[0];

  if (!node) {
    return parseErr("background-clip", createError("invalid-syntax", "Expected box value"));
  }

  // Handle var(), calc(), and other CSS functions
  if (Ast.isFunctionNode(node)) {
    return parseNodeToCssValue(node);
  }

  // Handle keyword identifiers
  if (Ast.isIdentifier(node)) {
    const val = node.name.toLowerCase();
    if (BACKGROUND_CLIP.includes(val as BackgroundClip)) {
      return parseOk({ kind: "keyword", value: val });
    }

    return parseErr(
      "background-clip",
      createError(
        "invalid-value",
        `Invalid background-clip value: '${val}'. Expected: border-box, padding-box, content-box, text, or a CSS function like var()`,
      ),
    );
  }

  // Fallback: try generic parser
  return parseNodeToCssValue(node);
}
