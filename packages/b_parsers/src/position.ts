// b_path:: packages/b_parsers/src/position.ts
import type * as csstree from "css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import type * as Type from "@b/types";
import { parseLengthPercentageNode } from "./length";

/**
 * Parse position value from AST node (keyword, length, or percentage).
 *
 * @see https://drafts.csswg.org/css-backgrounds-3/#typedef-bg-position
 */
export function parsePositionValueNode(node: csstree.CssNode): ParseResult<Type.PositionValue> {
  if (node.type === "Identifier") {
    const keyword = node.name.toLowerCase();
    if (["center", "left", "right", "top", "bottom"].includes(keyword)) {
      return parseOk(keyword as Type.PositionValue);
    }
    return parseErr(createError("invalid-value", `Invalid position keyword: '${keyword}'`));
  }

  const lengthResult = parseLengthPercentageNode(node);
  if (lengthResult.ok) {
    return lengthResult;
  }

  // Propagate errors from length parser
  return lengthResult;
}

/**
 * Parse 2D position from array of AST nodes.
 *
 * @see https://drafts.csswg.org/css-backgrounds-3/#typedef-bg-position
 */
export function parsePosition2D(
  nodes: csstree.CssNode[],
  startIdx: number,
): ParseResult<{ position: Type.Position2D; nextIdx: number }> {
  let idx = startIdx;

  const positionValues: Type.PositionValue[] = [];

  if (idx >= nodes.length) {
    return parseErr(createError("invalid-syntax", "Expected position value"));
  }

  const firstNode = nodes[idx];
  if (!firstNode) {
    return parseErr(createError("invalid-syntax", "Missing first position value"));
  }

  const firstValue = parsePositionValueNode(firstNode);
  if (!firstValue.ok) {
    return firstValue as ParseResult<{ position: Type.Position2D; nextIdx: number }>;
  }
  positionValues.push(firstValue.value);
  idx++;

  if (idx < nodes.length) {
    const secondNode = nodes[idx];
    if (secondNode) {
      const secondValue = parsePositionValueNode(secondNode);
      if (secondValue.ok) {
        positionValues.push(secondValue.value);
        idx++;
      }
    }
  }

  let position: Type.Position2D;

  if (positionValues.length === 1) {
    const val = positionValues[0];
    if (!val) {
      return parseErr(createError("invalid-syntax", "Missing position value"));
    }
    if (typeof val === "string") {
      if (val === "top" || val === "bottom") {
        position = { horizontal: "center", vertical: val };
      } else {
        position = { horizontal: val, vertical: "center" };
      }
    } else {
      position = { horizontal: val, vertical: "center" };
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

/**
 * Parse optional "at <position>" clause in gradients.
 *
 * @see https://drafts.csswg.org/css-images-4/#radial-gradients
 */
export function parseAtPosition(
  children: csstree.CssNode[],
  startIdx: number,
): ParseResult<{ position?: Type.Position2D; nextIdx: number }> {
  let idx = startIdx;

  if (idx >= children.length) {
    return parseOk({ nextIdx: idx });
  }

  const atNode = children[idx];
  if (atNode?.type !== "Identifier" || atNode.name.toLowerCase() !== "at") {
    return parseOk({ nextIdx: idx });
  }

  idx++;

  const positionNodes = children.slice(idx);
  if (positionNodes.length === 0) {
    return parseErr(createError("invalid-syntax", "Expected position after 'at'"));
  }

  const posResult = parsePosition2D(positionNodes, 0);
  if (!posResult.ok) return posResult;

  return parseOk({
    position: posResult.value.position,
    nextIdx: idx + posResult.value.nextIdx,
  });
}
