// b_path:: packages/b_parsers/src/blend-mode.ts

import type * as csstree from "@eslint/css-tree";
import { BLEND_MODE, type BlendMode } from "@b/keywords";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import * as Ast from "@b/utils";

/**
 * Parse CSS <blend-mode> value
 * @see https://drafts.fxtf.org/compositing/#ltblendmodegt
 */
export function parse(valueNode: csstree.Value): ParseResult<BlendMode> {
  const nodes = Ast.nodeListToArray(valueNode.children);
  const node = nodes[0];

  if (!node || !Ast.isIdentifier(node)) {
    return parseErr("blend-mode", createError("invalid-syntax", "Expected blend-mode value"));
  }

  const val = node.name.toLowerCase();
  if (BLEND_MODE.includes(val as BlendMode)) {
    return parseOk(val as BlendMode);
  }

  return parseErr("blend-mode", createError("invalid-value", `Invalid blend-mode: '${val}'`));
}
