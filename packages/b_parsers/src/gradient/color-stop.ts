// b_path:: packages/b_parsers/src/gradient/color-stop.ts
import type * as csstree from "css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import type * as Type from "@b/types";
import { parseCssValueNode } from "@b/utils";
import * as Color from "../color";

/**
 * Parse color stop from CSS AST nodes.
 * Now supports CssValue for positions (var, calc, literals).
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient#color-stops
 */
export function fromNodes(nodes: csstree.CssNode[]): ParseResult<Type.ColorStop> {
  if (nodes.length === 0) {
    return parseErr(createError("missing-value", "Color stop requires at least a color value"));
  }

  const firstNode = nodes[0];
  if (!firstNode) {
    return parseErr(createError("missing-value", "Color stop requires at least a color value"));
  }

  const colorResult = Color.parseNode(firstNode);
  if (!colorResult.ok) {
    return parseErr(createError("invalid-value", `Invalid color value: ${colorResult.issues[0]?.message}`));
  }

  if (nodes.length === 1) {
    return parseOk({ color: colorResult.value });
  }

  // Parse position(s) as CssValue to support var/calc
  const positions: Type.CssValue[] = [];

  for (let i = 1; i < nodes.length; i++) {
    const posNode = nodes[i];
    if (!posNode) continue;

    const posResult = parseCssValueNode(posNode);
    if (posResult.ok) {
      positions.push(posResult.value);
    } else {
      return parseErr(createError("invalid-value", `Invalid color stop position: ${posResult.issues[0]?.message}`));
    }
  }

  if (positions.length === 0) {
    return parseOk({ color: colorResult.value });
  }

  if (positions.length === 1) {
    return parseOk({
      color: colorResult.value,
      position: positions[0],
    });
  }

  if (positions.length === 2) {
    return parseOk({
      color: colorResult.value,
      position: [positions[0], positions[1]] as [Type.CssValue, Type.CssValue],
    });
  }

  return parseErr(createError("invalid-value", "Color stop can have at most 2 positions"));
}
