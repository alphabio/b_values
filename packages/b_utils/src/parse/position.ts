import type * as csstree from "css-tree";
import { err, ok, type Result } from "@b/types";
import type * as Type from "@b/types";
import { parseLengthPercentageNode } from "./length";

/**
 * @see https://drafts.csswg.org/css-backgrounds-3/#typedef-bg-position
 */
export function parsePositionValueNode(node: csstree.CssNode): Result<Type.PositionValue, string> {
  if (node.type === "Identifier") {
    const keyword = node.name.toLowerCase();
    if (["center", "left", "right", "top", "bottom"].includes(keyword)) {
      return ok(keyword as Type.PositionValue);
    }
    return err(`Invalid position keyword: ${keyword}`);
  }

  const lengthResult = parseLengthPercentageNode(node);
  if (lengthResult.ok) {
    return lengthResult;
  }

  return err("Expected position keyword, length, or percentage");
}

/**
 * @see https://drafts.csswg.org/css-backgrounds-3/#typedef-bg-position
 */
export function parsePosition2D(
  nodes: csstree.CssNode[],
  startIdx: number,
): Result<{ position: Type.Position2D; nextIdx: number }, string> {
  let idx = startIdx;

  const positionValues: Type.PositionValue[] = [];

  if (idx >= nodes.length) {
    return err("Expected position value");
  }

  const firstNode = nodes[idx];
  if (!firstNode) return err("Missing first position value");
  const firstValue = parsePositionValueNode(firstNode);
  if (!firstValue.ok) {
    return err(`Invalid first position value: ${firstValue.error}`);
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
      return err("Missing position value");
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
      return err("Missing position values");
    }
    position = { horizontal: h, vertical: v };
  }

  return ok({ position, nextIdx: idx });
}

/**
 * @see https://drafts.csswg.org/css-images-4/#radial-gradients
 */
export function parseAtPosition(
  children: csstree.CssNode[],
  startIdx: number,
): Result<{ position?: Type.Position2D; nextIdx: number }, string> {
  let idx = startIdx;

  if (idx >= children.length) {
    return ok({ nextIdx: idx });
  }

  const atNode = children[idx];
  if (atNode?.type !== "Identifier" || atNode.name.toLowerCase() !== "at") {
    return ok({ nextIdx: idx });
  }

  idx++;

  const positionNodes = children.slice(idx);
  if (positionNodes.length === 0) {
    return err("Expected position after 'at'");
  }

  const posResult = parsePosition2D(positionNodes, 0);
  if (!posResult.ok) return posResult;

  return ok({
    position: posResult.value.position,
    nextIdx: idx + posResult.value.nextIdx,
  });
}
