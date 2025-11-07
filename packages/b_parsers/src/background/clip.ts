// b_path:: packages/b_parsers/src/background/clip.ts

import type * as csstree from "@eslint/css-tree";
import { BACKGROUND_CLIP, type BackgroundClip } from "@b/keywords";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import * as Ast from "@b/utils";

/**
 * Parse a single background-clip value from a CSS AST node.
 *
 * Syntax: border-box | padding-box | content-box | text
 *
 * @param valueNode - The Value node containing the box value
 * @returns ParseResult with BackgroundClip
 */
export function parseBackgroundClipValue(valueNode: csstree.Value): ParseResult<BackgroundClip> {
  const nodes = Ast.nodeListToArray(valueNode.children);
  const node = nodes[0];

  if (!node || !Ast.isIdentifier(node)) {
    return parseErr("background-clip", createError("invalid-syntax", "Expected box value"));
  }

  const val = node.name.toLowerCase();
  if (BACKGROUND_CLIP.includes(val as BackgroundClip)) {
    return parseOk(val as BackgroundClip);
  }

  return parseErr(
    "background-clip",
    createError(
      "invalid-value",
      `Invalid background-clip value: '${val}'. Expected: border-box, padding-box, content-box, or text`,
    ),
  );
}
