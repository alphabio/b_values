// b_path:: packages/b_parsers/src/gradient/conic.ts
import type * as csstree from "css-tree";
import { createError, parseErr, parseOk, forwardParseErr, type ParseResult } from "@b/types";
import type * as Type from "@b/types";
import { parseCssValueNodeWrapper } from "../css-value-parser";
import { parsePosition2D } from "../position";
import * as ColorStop from "./color-stop";
import * as SharedParsing from "./shared-parsing";
import * as Utils from "../utils";

/**
 * Parse conic gradient from CSS function AST with flexible component ordering.
 * Supports CSS spec: [ [ [ from <angle> ]? [ at <position> ]? ] || <color-interpolation-method> ]?
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
  let hasFromAngle = false;
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

      // From angle: "from <angle>"
      if (value === "from") {
        if (hasFromAngle) {
          return parseErr(createError("invalid-syntax", "Duplicate 'from' angle component"));
        }
        hasFromAngle = true;
        idx++;

        const angleNode = children[idx];
        if (
          !angleNode ||
          angleNode.type === "Operator" ||
          (angleNode.type === "Identifier" && ["at", "in", "from"].includes(angleNode.name.toLowerCase()))
        ) {
          return parseErr(createError("invalid-syntax", "conic-gradient 'from' keyword requires an angle value"));
        }

        const angleResult = parseCssValueNodeWrapper(angleNode);
        if (!angleResult.ok) {
          return forwardParseErr<Type.ConicGradient>(angleResult);
        }
        fromAngle = angleResult.value;
        idx++;
        continue;
      }

      // Position: "at <position>"
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
          if (posNode.type === "Identifier" && posNode.name.toLowerCase() === "from") break;

          positionNodes.push(posNode);
          idx++;
        }

        if (positionNodes.length === 0) {
          return parseErr(createError("invalid-syntax", "conic-gradient 'at' keyword requires position values"));
        }
        const posResult = parsePosition2D(positionNodes, 0);
        if (!posResult.ok) {
          return forwardParseErr<Type.ConicGradient>(posResult);
        }
        position = posResult.value.position;
        continue;
      }

      // Color interpolation: "in <colorspace>"
      if (value === "in") {
        if (hasInterpolation) {
          return parseErr(createError("invalid-syntax", "Duplicate color interpolation method"));
        }
        hasInterpolation = true;

        const interpolationResult = Utils.parseColorInterpolationMethod(children, idx);
        if (!interpolationResult) {
          return parseErr(createError("invalid-syntax", "conic-gradient 'in' keyword requires a color space"));
        }
        colorInterpolationMethod = interpolationResult.method;
        idx = interpolationResult.nextIndex;
        continue;
      }

      // Could be a color stop (named color) - break to color stop parsing
      break;
    }

    // Function or Hash → color stop
    if (node.type === "Function" || node.type === "Hash") {
      break;
    }

    // Dimension, Number, Percentage → could be angle or color stop
    // If we have fromAngle already, it's likely a color stop
    if (node.type === "Dimension" || node.type === "Number" || node.type === "Percentage") {
      // Without 'from' keyword, dimensions are likely color stops
      break;
    }

    // Unknown token
    return parseErr(createError("invalid-value", `Unexpected token in gradient: ${node.type}`));
  }

  // Parse color stops
  const stopGroups = Utils.Ast.splitNodesByComma(children, { startIndex: idx });

  const colorStops: Type.ColorStopOrHint[] = [];
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
  const funcResult = SharedParsing.parseCssToGradientFunction(css, ["conic-gradient", "repeating-conic-gradient"]);
  if (!funcResult.ok) {
    return forwardParseErr<Type.ConicGradient>(funcResult);
  }

  const result = fromFunction(funcResult.value);

  // Add warning if parentheses are unbalanced
  const parenIssue = SharedParsing.validateParentheses(css, "conic");
  if (result.ok && parenIssue) {
    return {
      ...result,
      issues: [...result.issues, parenIssue],
    };
  }

  return result;
}
