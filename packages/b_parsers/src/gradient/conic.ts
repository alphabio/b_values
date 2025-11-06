// b_path:: packages/b_parsers/src/gradient/conic.ts
import type * as csstree from "css-tree";
import { createError, parseErr, parseOk, forwardParseErr, type ParseResult } from "@b/types";
import type * as Type from "@b/types";
import { parseCssValueNode } from "@b/utils";
import { parsePosition2D } from "../position";
import * as ColorStop from "./color-stop";
import * as Utils from "../utils";

/**
 * Parse conic gradient from CSS function AST.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/conic-gradient
 */
export function fromFunction(fn: csstree.FunctionNode): ParseResult<Type.ConicGradient> {
  const functionName = fn.name.toLowerCase();
  const isRepeating = functionName === "repeating-conic-gradient";

  if (!isRepeating && functionName !== "conic-gradient") {
    return parseErr(
      createError("invalid-value", `Expected conic-gradient or repeating-conic-gradient, got: ${functionName}`),
    );
  }

  const children = fn.children.toArray();
  if (children.length === 0) {
    return parseErr(createError("missing-value", "conic-gradient requires at least 2 color stops"));
  }

  let fromAngle: Type.CssValue | undefined;
  let position: Type.Position2D | undefined;
  let colorInterpolationMethod: Type.ColorInterpolationMethod | undefined;

  let idx = 0;

  const fromNode = children[idx];
  if (fromNode?.type === "Identifier" && fromNode.name.toLowerCase() === "from") {
    idx++;
    const angleNode = children[idx];
    if (angleNode) {
      // Use parseCssValueNode to support var(), calc(), and literals
      const angleResult = parseCssValueNode(angleNode);
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

  const interpolationResult = Utils.parseColorInterpolationMethod(children, idx);
  if (interpolationResult) {
    colorInterpolationMethod = interpolationResult.method;
    idx = interpolationResult.nextIndex;
    idx = Utils.Ast.skipComma(children, idx);
  }

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
    // Return partial gradient to enable generator warnings on successfully parsed stops
    return {
      ok: false,
      value: {
        kind: "conic",
        fromAngle,
        position,
        colorInterpolationMethod,
        colorStops,
        repeating: isRepeating,
      },
      issues,
    };
  }

  if (colorStops.length < 2) {
    return parseErr(createError("invalid-value", "conic-gradient requires at least 2 color stops"));
  }

  return parseOk({
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
export function parse(css: string): ParseResult<Type.ConicGradient> {
  const astResult = Utils.Ast.parseCssString(css, "value");
  if (!astResult.ok) {
    return forwardParseErr<Type.ConicGradient>(astResult);
  }

  const funcResult = Utils.Ast.findFunctionNode(astResult.value, ["conic-gradient", "repeating-conic-gradient"]);
  if (!funcResult.ok) {
    return forwardParseErr<Type.ConicGradient>(funcResult);
  }

  return fromFunction(funcResult.value);
}
