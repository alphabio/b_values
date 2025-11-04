// b_path:: packages/b_utils/src/parse/color/rgb.ts
import type * as csstree from "css-tree";
import { err, ok, type Result } from "@b/types";
import type { RGBColor } from "@b/types";
import { parseCssValueNode, getChildren, getValues } from "./helpers";

/**
 * Parse rgb() or rgba() function
 * @see https://drafts.csswg.org/css-color/#rgb-functions
 */
export function parseRgbFunction(node: csstree.FunctionNode): Result<RGBColor, string> {
  if (node.name !== "rgb" && node.name !== "rgba") {
    return err("Expected rgb() or rgba() function");
  }

  const values = getValues(getChildren(node));

  if (values.length < 3 || values.length > 4) {
    return err(`RGB function must have 3 or 4 values, got ${values.length}`);
  }

  const rResult = parseCssValueNode(values[0]);
  if (!rResult.ok) return rResult;

  const gResult = parseCssValueNode(values[1]);
  if (!gResult.ok) return gResult;

  const bResult = parseCssValueNode(values[2]);
  if (!bResult.ok) return bResult;

  const rgb: RGBColor = {
    kind: "rgb",
    r: rResult.value,
    g: gResult.value,
    b: bResult.value,
  };

  if (values.length === 4) {
    const alphaResult = parseCssValueNode(values[3]);
    if (!alphaResult.ok) return alphaResult;
    rgb.alpha = alphaResult.value;
  }

  return ok(rgb);
}
