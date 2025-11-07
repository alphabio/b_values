// b_path:: packages/b_parsers/src/background-attachment/parser.ts

import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import * as Ast from "@b/utils";

const VALID_VALUES = ["scroll", "fixed", "local"] as const;
type AttachmentValue = (typeof VALID_VALUES)[number];

/**
 * Parse a single background-attachment value from a CSS AST node.
 *
 * Syntax: scroll | fixed | local
 *
 * @param valueNode - The Value node containing the attachment value
 * @returns ParseResult with AttachmentValue
 */
export function parseBackgroundAttachmentValue(valueNode: csstree.Value): ParseResult<AttachmentValue> {
  const nodes = Ast.nodeListToArray(valueNode.children);
  const node = nodes[0];

  if (!node || !Ast.isIdentifier(node)) {
    return parseErr(createError("invalid-syntax", "Expected attachment value"));
  }

  const val = node.name.toLowerCase();
  if (VALID_VALUES.includes(val as AttachmentValue)) {
    return parseOk(val as AttachmentValue);
  }

  return parseErr(
    createError("invalid-value", `Invalid background-attachment value: '${val}'. Expected: scroll, fixed, or local`),
  );
}
