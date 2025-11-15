// b_path:: packages/b_parsers/src/filter/drop-shadow.ts

import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import type * as Type from "@b/types";
import { parseLengthNode } from "../length";
import * as Color from "../color";

/**
 * Parse drop-shadow filter function from css-tree AST
 * @see https://drafts.fxtf.org/filter-effects/#funcdef-filter-drop-shadow
 */

export function parseDropShadowFunction(node: csstree.FunctionNode): ParseResult<Type.DropShadowFunction> {
  const funcName = node.name.toLowerCase();
  const children = Array.from(node.children);
  const args = children.filter((n) => n.type !== "WhiteSpace");

  if (funcName !== "drop-shadow") {
    return parseErr("filter", createError("unsupported-kind", `Expected drop-shadow function, got ${funcName}`));
  }

  if (args.length < 2 || args.length > 4) {
    return parseErr("filter", createError("invalid-syntax", "drop-shadow() requires 2-4 arguments"));
  }

  // Parse arguments: color? length{2,3}
  // Color can appear at start or end
  let color: Type.Color | undefined;
  const lengths: Type.Length[] = [];

  for (const arg of args) {
    // Try to parse as color
    const colorResult = Color.parseNode(arg);
    if (colorResult.ok) {
      if (color) {
        return parseErr("filter", createError("invalid-syntax", "drop-shadow() can only have one color"));
      }
      color = colorResult.value;
      continue;
    }

    // Try to parse as length
    const lengthResult = parseLengthNode(arg);
    if (lengthResult.ok) {
      lengths.push(lengthResult.value);
      continue;
    }

    return parseErr("filter", createError("invalid-value", "Invalid argument in drop-shadow()"));
  }

  // Validate lengths (must be 2 or 3)
  if (lengths.length < 2 || lengths.length > 3) {
    return parseErr("filter", createError("invalid-syntax", "drop-shadow() requires 2 or 3 length values"));
  }

  return parseOk({
    kind: "drop-shadow",
    offsetX: lengths[0],
    offsetY: lengths[1],
    blurRadius: lengths[2],
    color,
  });
}
