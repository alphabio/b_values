// b_path:: packages/b_parsers/src/gradient/color-stop.ts
import type * as csstree from "css-tree";
import { err, ok, type Result } from "@b/types";
import type * as Type from "@b/types";
import * as Color from "../color";

/**
 * Parse color stop from CSS AST nodes.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient#color-stops
 */
export function fromNodes(nodes: csstree.CssNode[]): Result<Type.ColorStop, string> {
  if (nodes.length === 0) {
    return err("Color stop requires at least a color value");
  }

  const firstNode = nodes[0];
  if (!firstNode) {
    return err("Color stop requires at least a color value");
  }

  const colorResult = Color.parseNode(firstNode);
  if (!colorResult.ok) {
    return err(`Invalid color value: ${colorResult.issues[0]?.message}`);
  }

  if (nodes.length === 1) {
    return ok({ color: colorResult.value });
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
      return err(`Unitless numbers (other than 0) are not valid for color stop positions: ${posNode.value}`);
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

    return err(`Invalid position type: ${posNode.type}`);
  }

  if (positions.length === 0) {
    return ok({ color: colorResult.value });
  }

  if (positions.length === 1) {
    return ok({
      color: colorResult.value,
      position: positions[0],
    });
  }

  return ok({
    color: colorResult.value,
    position: [positions[0], positions[1]] as [Type.LengthPercentage | Type.Angle, Type.LengthPercentage | Type.Angle],
  });
}
