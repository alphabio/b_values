import type * as csstree from "css-tree";
import { err, ok, type Result } from "@b/types";
import type * as Type from "@b/types";
import * as Unit from "@b/units";

/**
 * @see https://drafts.csswg.org/css-values-4/#angles
 */
export function parseAngleNode(node: csstree.CssNode): Result<Type.Angle, string> {
  if (node.type === "Dimension") {
    const value = Number.parseFloat(node.value);
    if (Number.isNaN(value)) {
      return err("Invalid angle value");
    }

    if (!Unit.ANGLE_UNITS.includes(node.unit as (typeof Unit.ANGLE_UNITS)[number])) {
      return err(`Invalid angle unit: ${node.unit}`);
    }

    return ok({ value, unit: node.unit as (typeof Unit.ANGLE_UNITS)[number] });
  }
  return err("Expected angle dimension");
}
