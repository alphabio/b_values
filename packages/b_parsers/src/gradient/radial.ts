// b_path:: packages/b_parsers/src/gradient/radial.ts
import type * as csstree from "css-tree";
import { err, ok, type Result } from "@b/types";
import type * as Type from "@b/types";
import type { RadialShape, RadialSizeKeyword } from "@b/keywords";
import { parseLengthPercentageNode } from "../length";
import { parsePosition2D } from "../position";
import * as ColorStop from "./color-stop";
import * as Utils from "../utils";

/**
 * Parse radial gradient shape and size from nodes.
 */
function parseShapeAndSize(
  nodes: csstree.CssNode[],
  startIdx: number,
): Result<
  {
    shape?: RadialShape;
    size?: Type.RadialGradientSize;
    nextIdx: number;
  },
  string
> {
  let idx = startIdx;
  let shape: RadialShape | undefined;
  let size: Type.RadialGradientSize | undefined;

  const node = nodes[idx];
  if (!node) {
    return ok({ nextIdx: idx });
  }

  if (node.type === "Identifier") {
    const value = node.name.toLowerCase();

    if (value === "circle" || value === "ellipse") {
      shape = value as RadialShape;
      idx++;

      const nextNode = nodes[idx];
      if (nextNode?.type === "Identifier") {
        const sizeKeyword = nextNode.name.toLowerCase();
        if (["closest-side", "closest-corner", "farthest-side", "farthest-corner"].includes(sizeKeyword)) {
          size = {
            kind: "keyword",
            value: sizeKeyword as RadialSizeKeyword,
          };
          idx++;
        }
      } else if (nextNode?.type === "Dimension" || nextNode?.type === "Percentage") {
        if (shape === "circle") {
          const radiusResult = parseLengthPercentageNode(nextNode);
          if (radiusResult.ok) {
            size = {
              kind: "circle-explicit",
              radius: radiusResult.value,
            };
            idx++;
          }
        } else {
          const rxResult = parseLengthPercentageNode(nextNode);
          if (rxResult.ok) {
            idx++;
            const ryNode = nodes[idx];
            if (ryNode && (ryNode.type === "Dimension" || ryNode.type === "Percentage")) {
              const ryResult = parseLengthPercentageNode(ryNode);
              if (ryResult.ok) {
                size = {
                  kind: "ellipse-explicit",
                  radiusX: rxResult.value,
                  radiusY: ryResult.value,
                };
                idx++;
              }
            }
          }
        }
      }
    } else if (["closest-side", "closest-corner", "farthest-side", "farthest-corner"].includes(value)) {
      size = {
        kind: "keyword",
        value: value as RadialSizeKeyword,
      };
      idx++;

      const nextNode = nodes[idx];
      if (nextNode?.type === "Identifier") {
        const shapeValue = nextNode.name.toLowerCase();
        if (shapeValue === "circle" || shapeValue === "ellipse") {
          shape = shapeValue as RadialShape;
          idx++;
        }
      }
    }
  } else if (node.type === "Dimension" || node.type === "Percentage") {
    const firstResult = parseLengthPercentageNode(node);
    if (firstResult.ok) {
      idx++;
      const secondNode = nodes[idx];

      if (secondNode && (secondNode.type === "Dimension" || secondNode.type === "Percentage")) {
        const secondResult = parseLengthPercentageNode(secondNode);
        if (secondResult.ok) {
          size = {
            kind: "ellipse-explicit",
            radiusX: firstResult.value,
            radiusY: secondResult.value,
          };
          idx++;
        }
      } else {
        size = {
          kind: "circle-explicit",
          radius: firstResult.value,
        };
      }
    }
  }

  return ok({ shape, size, nextIdx: idx });
}

/**
 * Parse radial gradient from CSS function AST.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/radial-gradient
 */
export function fromFunction(fn: csstree.FunctionNode): Result<Type.RadialGradient, string> {
  const functionName = fn.name.toLowerCase();
  const isRepeating = functionName === "repeating-radial-gradient";

  if (!isRepeating && functionName !== "radial-gradient") {
    return err(`Expected radial-gradient or repeating-radial-gradient, got: ${functionName}`);
  }

  const children = fn.children.toArray();
  if (children.length === 0) {
    return err("radial-gradient requires at least 2 color stops");
  }

  let shape: RadialShape | undefined;
  let size: Type.RadialGradientSize | undefined;
  let position: Type.Position2D | undefined;
  let colorInterpolationMethod: Type.ColorInterpolationMethod | undefined;

  let idx = 0;

  const shapeAndSizeResult = parseShapeAndSize(children, idx);
  if (shapeAndSizeResult.ok) {
    shape = shapeAndSizeResult.value.shape;
    size = shapeAndSizeResult.value.size;
    idx = shapeAndSizeResult.value.nextIdx;
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
    return err("radial-gradient requires at least 2 color stops");
  }

  return ok({
    kind: "radial",
    shape,
    size,
    position,
    colorInterpolationMethod,
    colorStops,
    repeating: isRepeating,
  });
}

/**
 * Parse a CSS radial gradient value into IR.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/radial-gradient
 */
export function parse(css: string): Result<Type.RadialGradient, string> {
  const astResult = Utils.Ast.parseCssString(css, "value");
  if (!astResult.ok) {
    return astResult;
  }

  const funcResult = Utils.Ast.findFunctionNode(astResult.value, ["radial-gradient", "repeating-radial-gradient"]);
  if (!funcResult.ok) {
    return funcResult;
  }

  return fromFunction(funcResult.value);
}
