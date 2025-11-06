// b_path:: packages/b_parsers/src/position.ts
import type * as csstree from "css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import type * as Type from "@b/types";
import { parseCssValueNode } from "@b/utils";

/**
 * Parse 2D position from array of AST nodes.
 * Now supports CssValue (var, calc, keywords, literals).
 *
 * @see https://drafts.csswg.org/css-backgrounds-3/#typedef-bg-position
 */
export function parsePosition2D(
  nodes: csstree.CssNode[],
  startIdx: number,
): ParseResult<{ position: Type.Position2D; nextIdx: number }> {
  let idx = startIdx;

  if (idx >= nodes.length) {
    return parseErr(createError("invalid-syntax", "Expected position value"));
  }

  const positionValues: Type.CssValue[] = [];

  // Parse first value
  const firstNode = nodes[idx];
  if (!firstNode) {
    return parseErr(createError("invalid-syntax", "Missing first position value"));
  }

  const firstValue = parseCssValueNode(firstNode);
  if (!firstValue.ok) {
    return parseErr(createError("invalid-value", "Invalid first position value"));
  }
  positionValues.push(firstValue.value);
  idx++;

  // Parse second value if present
  if (idx < nodes.length) {
    const secondNode = nodes[idx];
    if (secondNode && secondNode.type !== "Operator") {
      const secondValue = parseCssValueNode(secondNode);
      if (secondValue.ok) {
        positionValues.push(secondValue.value);
        idx++;
      }
    }
  }

  // Build position object
  let position: Type.Position2D;

  if (positionValues.length === 1) {
    const val = positionValues[0];
    if (!val) {
      return parseErr(createError("invalid-syntax", "Missing position value"));
    }
    // Single value: assume horizontal, vertical is center
    // Handle keywords if needed (top/bottom vs left/right)
    if (val.kind === "keyword" && (val.value === "top" || val.value === "bottom")) {
      position = { horizontal: { kind: "keyword", value: "center" }, vertical: val };
    } else {
      position = { horizontal: val, vertical: { kind: "keyword", value: "center" } };
    }
  } else {
    const h = positionValues[0];
    const v = positionValues[1];
    if (!h || !v) {
      return parseErr(createError("invalid-syntax", "Missing position values"));
    }
    position = { horizontal: h, vertical: v };
  }

  return parseOk({ position, nextIdx: idx });
}
