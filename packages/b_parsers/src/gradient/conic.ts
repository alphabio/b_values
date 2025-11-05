// b_path:: packages/b_parsers/src/gradient/conic.ts
import type * as csstree from "css-tree";
import { err, ok, type Result } from "@b/types";
import type * as Type from "@b/types";
import { parseAngleNode } from "../angle";
import { parsePosition2D } from "../position";
import * as ColorStop from "./color-stop";
import * as Utils from "../utils";

/**
 * Parse conic gradient from CSS function AST.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/conic-gradient
 */
export function fromFunction(fn: csstree.FunctionNode): Result<Type.ConicGradient, string> {
  const functionName = fn.name.toLowerCase();
  const isRepeating = functionName === "repeating-conic-gradient";

  if (!isRepeating && functionName !== "conic-gradient") {
    return err(`Expected conic-gradient or repeating-conic-gradient, got: ${functionName}`);
  }

  const children = fn.children.toArray();
  if (children.length === 0) {
    return err("conic-gradient requires at least 2 color stops");
  }

  let fromAngle: Type.Angle | undefined;
  let position: Type.Position2D | undefined;
  let colorInterpolationMethod: Type.ColorInterpolationMethod | undefined;

  let idx = 0;

  const fromNode = children[idx];
  if (fromNode?.type === "Identifier" && fromNode.name.toLowerCase() === "from") {
    idx++;
    const angleNode = children[idx];
    if (angleNode) {
      const angleResult = parseAngleNode(angleNode);
      if (angleResult.ok) {
        fromAngle = angleResult.value;
        idx++;
      }
    }
  }

  const atNode = children[idx];
  if (atNode?.type === "Identifier" && atNode.name.toLowerCase() === "at") {
    idx++;
    const positionNodes: csstree.CssNode[] = [];

    while (idx < children.length) {
      const node = children[idx];
      if (!node) break;
      if (node.type === "Operator" && node.value === ",") break;
      if (node.type === "Identifier" && node.name.toLowerCase() === "in") break;

      positionNodes.push(node);
      idx++;
    }

    if (positionNodes.length > 0) {
      const posResult = parsePosition2D(positionNodes, 0);
      if (posResult.ok) {
        position = posResult.value.position;
      }
    }
  }

  idx = Utils.Ast.skipComma(children, idx);

  if (idx < children.length) {
    const node = children[idx];
    if (node?.type === "Identifier" && node.name.toLowerCase() === "in") {
      idx++;
      const spaceNode = children[idx];
      if (spaceNode?.type === "Identifier") {
        const space = spaceNode.name.toLowerCase();
        colorInterpolationMethod = { colorSpace: space } as Type.ColorInterpolationMethod;
        idx++;

        const hueNode = children[idx];
        if (hueNode?.type === "Identifier") {
          const hueWord1 = hueNode.name.toLowerCase();
          if (
            hueWord1 === "longer" ||
            hueWord1 === "shorter" ||
            hueWord1 === "increasing" ||
            hueWord1 === "decreasing"
          ) {
            idx++;
            const hueNode2 = children[idx];
            if (hueNode2?.type === "Identifier" && hueNode2.name.toLowerCase() === "hue") {
              colorInterpolationMethod = {
                colorSpace: space,
                hueInterpolationMethod: `${hueWord1} hue`,
              } as Type.ColorInterpolationMethod;
              idx++;
            }
          }
        }
      }

      idx = Utils.Ast.skipComma(children, idx);
    }
  }

  const stopGroups = Utils.Ast.splitNodesByComma(children, { startIndex: idx });

  const colorStops: Type.ColorStop[] = [];
  for (const stopNodes of stopGroups) {
    const stopResult = ColorStop.fromNodes(stopNodes);
    if (stopResult.ok) {
      colorStops.push(stopResult.value);
    } else {
      return err(`Invalid color stop: ${stopResult.error}`);
    }
  }

  if (colorStops.length < 2) {
    return err("conic-gradient requires at least 2 color stops");
  }

  return ok({
    kind: "conic",
    fromAngle,
    position,
    colorInterpolationMethod,
    colorStops,
    repeating: isRepeating,
  });
}

/**
 * Parse a CSS conic gradient value into IR.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/conic-gradient
 */
export function parse(css: string): Result<Type.ConicGradient, string> {
  const astResult = Utils.Ast.parseCssString(css, "value");
  if (!astResult.ok) {
    return astResult;
  }

  const funcResult = Utils.Ast.findFunctionNode(astResult.value, ["conic-gradient", "repeating-conic-gradient"]);
  if (!funcResult.ok) {
    return funcResult;
  }

  return fromFunction(funcResult.value);
}
