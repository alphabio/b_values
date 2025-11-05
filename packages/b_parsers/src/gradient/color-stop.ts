// b_path:: packages/b_parsers/src/gradient/color-stop.ts
import type * as csstree from "css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import type * as Type from "@b/types";
import * as Color from "../color";

/**
 * Parse color stop from CSS AST nodes.
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

  const positions: (Type.LengthPercentage | Type.Angle)[] = [];

  for (let i = 1; i < nodes.length; i++) {
    const posNode = nodes[i];
    if (!posNode) continue;

    if (posNode.type === "Percentage") {
      const value = Number.parseFloat(posNode.value);
      positions.push({ value, unit: "%" });
      continue;
    }

    if (posNode.type === "Number") {
      // Unitless 0 is valid for lengths
      const value = Number.parseFloat(posNode.value);
      if (value === 0) {
        positions.push({ value: 0, unit: "px" });
        continue;
      }
      return parseErr(
        createError(
          "invalid-value",
          `Unitless numbers (other than 0) are not valid for color stop positions: ${posNode.value}`,
        ),
      );
    }

    if (posNode.type === "Dimension") {
      const value = Number.parseFloat(posNode.value);
      const unit = posNode.unit.toLowerCase();

      if (unit === "deg" || unit === "rad" || unit === "grad" || unit === "turn") {
        positions.push({ value, unit } as Type.Angle);
      } else {
        positions.push({ value, unit } as Type.LengthPercentage);
      }
      continue;
    }

    return parseErr(createError("invalid-value", `Invalid position type: ${posNode.type}`));
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

  return parseOk({
    color: colorResult.value,
    position: [positions[0], positions[1]] as [Type.LengthPercentage | Type.Angle, Type.LengthPercentage | Type.Angle],
  });
}
