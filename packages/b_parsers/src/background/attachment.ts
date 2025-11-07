// b_path:: packages/b_parsers/src/background/attachment.ts

import type * as csstree from "@eslint/css-tree";
import { BACKGROUND_ATTACHMENT, type BackgroundAttachment } from "@b/keywords";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import * as Ast from "@b/utils";

/**
 * Parse a single background-attachment value from a CSS AST node.
 *
 * Syntax: scroll | fixed | local
 *
 * @param valueNode - The Value node containing the attachment value
 * @returns ParseResult with BackgroundAttachment
 */
export function parseBackgroundAttachmentValue(valueNode: csstree.Value): ParseResult<BackgroundAttachment> {
  const nodes = Ast.nodeListToArray(valueNode.children);
  const node = nodes[0];

  if (!node || !Ast.isIdentifier(node)) {
    return parseErr("background-attachment", createError("invalid-syntax", "Expected attachment value"));
  }

  const val = node.name.toLowerCase();
  if (BACKGROUND_ATTACHMENT.includes(val as BackgroundAttachment)) {
    return parseOk(val as BackgroundAttachment);
  }

  return parseErr(
    "background-attachment",
    createError("invalid-value", `Invalid background-attachment value: '${val}'. Expected: scroll, fixed, or local`),
  );
}
