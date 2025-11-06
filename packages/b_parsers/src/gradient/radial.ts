// b_path:: packages/b_parsers/src/gradient/radial.ts
import type * as csstree from "css-tree";
import { createError, parseErr, parseOk, forwardParseErr, type ParseResult } from "@b/types";
import type * as Type from "@b/types";
import type { RadialShape, RadialSizeKeyword } from "@b/keywords";
import { parsePosition2D } from "../position";
import { parseCssValueNodeEnhanced } from "../css-value-parser-enhanced";
import * as ColorStop from "./color-stop";
import * as SharedParsing from "./shared-parsing";
import * as Utils from "../utils";
import { isCssValueFunction } from "../utils/css-value-functions";

/**
 * Parse radial gradient shape and size from nodes.
 */
function parseShapeAndSize(
  nodes: csstree.CssNode[],
  startIdx: number,
): ParseResult<{
  shape?: RadialShape;
  size?: Type.RadialGradientSize;
  nextIdx: number;
}> {
  let idx = startIdx;
  let shape: RadialShape | undefined;
  let size: Type.RadialGradientSize | undefined;

  const node = nodes[idx];
  if (!node) {
    return parseOk({ nextIdx: idx });
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
      } else if (
        nextNode &&
        (nextNode.type === "Dimension" || nextNode.type === "Percentage" || isCssValueFunction(nextNode))
      ) {
        if (shape === "circle") {
          const radiusResult = parseCssValueNodeEnhanced(nextNode);
          if (radiusResult.ok) {
            size = {
              kind: "circle-explicit",
              radius: radiusResult.value,
            };
            idx++;
          }
        } else {
          const rxResult = parseCssValueNodeEnhanced(nextNode);
          if (rxResult.ok) {
            idx++;
            const ryNode = nodes[idx];
            if (ryNode && (ryNode.type === "Dimension" || ryNode.type === "Percentage" || isCssValueFunction(ryNode))) {
              const ryResult = parseCssValueNodeEnhanced(ryNode);
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
    // Only parse bare dimensions/percentages as sizes, not functions
    // Functions as first node are likely colors (rgb, hsl, var, etc.)
    const firstResult = parseCssValueNodeEnhanced(node);
    if (firstResult.ok) {
      idx++;
      const secondNode = nodes[idx];

      if (
        secondNode &&
        (secondNode.type === "Dimension" || secondNode.type === "Percentage" || isCssValueFunction(secondNode))
      ) {
        const secondResult = parseCssValueNodeEnhanced(secondNode);
        if (secondResult.ok) {
          size = {
            kind: "ellipse-explicit",
            radiusX: firstResult.value,
            radiusY: secondResult.value,
          };
          idx++;

          // Check for shape after explicit ellipse size
          const shapeNode = nodes[idx];
          if (shapeNode?.type === "Identifier") {
            const shapeValue = shapeNode.name.toLowerCase();
            if (shapeValue === "circle" || shapeValue === "ellipse") {
              shape = shapeValue as RadialShape;
              idx++;
            }
          }
        }
      } else {
        size = {
          kind: "circle-explicit",
          radius: firstResult.value,
        };

        // Check for shape after explicit circle size
        const shapeNode = nodes[idx];
        if (shapeNode?.type === "Identifier") {
          const shapeValue = shapeNode.name.toLowerCase();
          if (shapeValue === "circle" || shapeValue === "ellipse") {
            shape = shapeValue as RadialShape;
            idx++;
          }
        }
      }
    }
  }

  return parseOk({ shape, size, nextIdx: idx });
}

/**
 * Parse radial gradient from CSS function AST with flexible component ordering.
 * Supports CSS spec: [ [ [ <radial-shape> || <radial-size> ]? [ at <position> ]? ] || <color-interpolation-method> ]?
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/radial-gradient
 */
export function fromFunction(fn: csstree.FunctionNode): ParseResult<Type.RadialGradient> {
  const functionName = fn.name.toLowerCase();
  const isRepeating = functionName === "repeating-radial-gradient";

  if (!isRepeating && functionName !== "radial-gradient") {
    return parseErr(
      createError("invalid-value", `Expected radial-gradient or repeating-radial-gradient, got: ${functionName}`),
    );
  }

  const children = fn.children.toArray();
  if (children.length === 0) {
    return parseErr(createError("missing-value", "radial-gradient requires at least 2 color stops"));
  }

  let shape: RadialShape | undefined;
  let size: Type.RadialGradientSize | undefined;
  let position: Type.Position2D | undefined;
  let colorInterpolationMethod: Type.ColorInterpolationMethod | undefined;

  let idx = 0;
  let hasShape = false;
  let hasSize = false;
  let hasPosition = false;
  let hasInterpolation = false;

  // Flexible component parsing: accept components in any order
  while (idx < children.length) {
    const node = children[idx];
    if (!node) break;

    // Skip commas between components (backwards compatibility)
    if (node.type === "Operator" && node.value === ",") {
      idx++;
      continue;
    }

    // Recognize component by first token
    if (node.type === "Identifier") {
      const value = node.name.toLowerCase();

      // Position component: "at <position>"
      if (value === "at") {
        if (hasPosition) {
          return parseErr(createError("invalid-syntax", "Duplicate position component"));
        }
        hasPosition = true;
        idx++;

        const positionNodes: csstree.CssNode[] = [];
        while (idx < children.length) {
          const posNode = children[idx];
          if (!posNode) break;
          if (posNode.type === "Operator" && posNode.value === ",") break;
          if (posNode.type === "Identifier" && posNode.name.toLowerCase() === "at") break;
          if (posNode.type === "Identifier" && posNode.name.toLowerCase() === "in") break;
          if (posNode.type === "Identifier" && ["circle", "ellipse"].includes(posNode.name.toLowerCase())) break;
          if (
            posNode.type === "Identifier" &&
            ["closest-side", "closest-corner", "farthest-side", "farthest-corner"].includes(posNode.name.toLowerCase())
          )
            break;

          positionNodes.push(posNode);
          idx++;
        }

        if (positionNodes.length > 0) {
          const posResult = parsePosition2D(positionNodes, 0);
          if (posResult.ok) {
            position = posResult.value.position;
          } else {
            return forwardParseErr<Type.RadialGradient>(posResult);
          }
        }
        continue;
      }

      // Color interpolation: "in <colorspace>"
      if (value === "in") {
        if (hasInterpolation) {
          return parseErr(createError("invalid-syntax", "Duplicate color interpolation method"));
        }
        hasInterpolation = true;

        const interpolationResult = Utils.parseColorInterpolationMethod(children, idx);
        if (interpolationResult) {
          colorInterpolationMethod = interpolationResult.method;
          idx = interpolationResult.nextIndex;
        }
        continue;
      }

      // Shape: "circle" or "ellipse" - parse shape and potentially adjacent size
      if (value === "circle" || value === "ellipse") {
        if (hasShape || hasSize) {
          return parseErr(createError("invalid-syntax", "Duplicate shape/size component"));
        }

        // Use the old parseShapeAndSize function which handles shape+size together
        const shapeAndSizeResult = parseShapeAndSize(children, idx);
        if (shapeAndSizeResult.ok) {
          shape = shapeAndSizeResult.value.shape;
          size = shapeAndSizeResult.value.size;
          // Mark both as parsed since they're a combined component
          hasShape = true;
          hasSize = true;
          idx = shapeAndSizeResult.value.nextIdx;
        } else {
          return forwardParseErr<Type.RadialGradient>(shapeAndSizeResult);
        }
        continue;
      }

      // Size keyword: "closest-side" etc. - parse size and potentially adjacent shape
      if (["closest-side", "closest-corner", "farthest-side", "farthest-corner"].includes(value)) {
        if (hasSize || hasShape) {
          return parseErr(createError("invalid-syntax", "Duplicate shape/size component"));
        }

        // Use parseShapeAndSize starting from this size keyword
        const shapeAndSizeResult = parseShapeAndSize(children, idx);
        if (shapeAndSizeResult.ok) {
          shape = shapeAndSizeResult.value.shape;
          size = shapeAndSizeResult.value.size;
          // Mark both as parsed since they're a combined component
          hasShape = true;
          hasSize = true;
          idx = shapeAndSizeResult.value.nextIdx;
        } else {
          return forwardParseErr<Type.RadialGradient>(shapeAndSizeResult);
        }
        continue;
      }

      // Could be a color stop (named color) - break to color stop parsing
      break;
    }

    // Dimension or Percentage → explicit size - parse size and potentially adjacent shape
    if (node.type === "Dimension" || node.type === "Percentage") {
      if (hasSize || hasShape) {
        // Could be a color stop position - break to color stop parsing
        break;
      }

      // Use parseShapeAndSize starting from this dimension
      const shapeAndSizeResult = parseShapeAndSize(children, idx);
      if (shapeAndSizeResult.ok) {
        shape = shapeAndSizeResult.value.shape;
        size = shapeAndSizeResult.value.size;
        // Mark both as parsed since they're a combined component
        hasShape = true;
        hasSize = true;
        idx = shapeAndSizeResult.value.nextIdx;
      } else {
        // Not a valid size, might be color stop
        break;
      }
      continue;
    }

    // Function or Hash → color stop, break to color stop parsing
    if (node.type === "Function" || node.type === "Hash") {
      break;
    }

    // Unknown token
    return parseErr(createError("invalid-value", `Unexpected token in gradient: ${node.type}`));
  }

  // Parse color stops
  const stopGroups = Utils.Ast.splitNodesByComma(children, { startIndex: idx });

  const colorStops: Type.ColorStop[] = [];
  const issues: Type.Issue[] = [];

  for (const stopNodes of stopGroups) {
    const stopResult = ColorStop.fromNodes(stopNodes);
    if (stopResult.ok) {
      colorStops.push(stopResult.value);
    } else {
      issues.push(...stopResult.issues);
    }
  }

  if (issues.length > 0) {
    return {
      ok: false,
      value: {
        kind: "radial",
        shape,
        size,
        position,
        colorInterpolationMethod,
        colorStops,
        repeating: isRepeating,
      },
      issues,
    };
  }

  if (colorStops.length < 2) {
    return parseErr(createError("invalid-value", "radial-gradient requires at least 2 color stops"));
  }

  return parseOk({
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
export function parse(css: string): ParseResult<Type.RadialGradient> {
  const funcResult = SharedParsing.parseCssToGradientFunction(css, ["radial-gradient", "repeating-radial-gradient"]);
  if (!funcResult.ok) {
    return forwardParseErr<Type.RadialGradient>(funcResult);
  }

  const result = fromFunction(funcResult.value);

  // Add warning if parentheses are unbalanced
  const parenIssue = SharedParsing.validateParentheses(css, "radial");
  if (result.ok && parenIssue) {
    return {
      ...result,
      issues: [...result.issues, parenIssue],
    };
  }

  return result;
}
