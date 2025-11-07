// b_path:: packages/b_parsers/src/gradient/linear.ts
import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, forwardParseErr, type ParseResult } from "@b/types";
import type * as Type from "@b/types";
import { parseNodeToCssValue } from "../utils";
import * as ColorStop from "./color-stop";
import * as SharedParsing from "./shared-parsing";
import * as Utils from "../utils";
import { isCssValueFunction } from "../utils/css-value-functions";

/**
 * Parse gradient direction from nodes.
 */
function parseDirection(
  nodes: csstree.CssNode[],
  startIdx: number,
): ParseResult<{ direction: Type.GradientDirection; nextIdx: number }> {
  let idx = startIdx;
  const node = nodes[idx];

  if (!node) {
    return parseErr(createError("missing-value", "Expected direction value"));
  }

  if (node.type === "Dimension" || node.type === "Number" || isCssValueFunction(node)) {
    const angleResult = parseNodeToCssValue(node);
    if (angleResult.ok) {
      return parseOk({
        direction: {
          kind: "angle",
          value: angleResult.value,
        },
        nextIdx: idx + 1,
      });
    }
  }

  if (node.type === "Identifier" && node.name.toLowerCase() === "to") {
    idx++;
    const firstKeyword = nodes[idx];
    if (!firstKeyword || firstKeyword.type !== "Identifier") {
      return parseErr(createError("invalid-syntax", "Expected side or corner keyword after 'to'"));
    }

    const first = firstKeyword.name.toLowerCase();
    idx++;

    const secondKeyword = nodes[idx];
    if (secondKeyword && secondKeyword.type === "Identifier") {
      const second = secondKeyword.name.toLowerCase();
      const corner = `${first} ${second}`;
      if (["top left", "top right", "bottom left", "bottom right"].includes(corner)) {
        return parseOk({
          direction: {
            kind: "to-corner",
            value: corner as "top left" | "top right" | "bottom left" | "bottom right",
          },
          nextIdx: idx + 1,
        });
      }
    }

    if (["top", "right", "bottom", "left"].includes(first)) {
      return parseOk({
        direction: {
          kind: "to-side",
          value: first as "top" | "right" | "bottom" | "left",
        },
        nextIdx: idx,
      });
    }

    return parseErr(createError("invalid-value", `Invalid direction keyword: ${first}`));
  }

  return parseErr(createError("invalid-syntax", "Invalid direction syntax"));
}

/**
 * Parse linear gradient from CSS function AST with flexible component ordering.
 * Supports CSS spec: [ <linear-gradient-syntax> ]?
 * Where direction (angle/to-side/to-corner) and interpolation can appear in any order
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient
 */
export function fromFunction(fn: csstree.FunctionNode): ParseResult<Type.LinearGradient> {
  const functionName = fn.name.toLowerCase();
  const isRepeating = functionName === "repeating-linear-gradient";

  if (!isRepeating && functionName !== "linear-gradient") {
    return parseErr(
      createError("invalid-value", `Expected linear-gradient or repeating-linear-gradient, got: ${functionName}`),
    );
  }

  const children = fn.children.toArray();
  if (children.length === 0) {
    return parseErr(createError("missing-value", "linear-gradient requires at least 2 color stops"));
  }

  let direction: Type.GradientDirection | undefined;
  let colorInterpolationMethod: Type.ColorInterpolationMethod | undefined;

  let idx = 0;
  let hasDirection = false;
  let hasInterpolation = false;

  // Flexible component parsing: accept direction and interpolation in any order
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

      // Direction: "to <side>" or "to <corner>"
      if (value === "to") {
        if (hasDirection) {
          return parseErr(createError("invalid-syntax", "Duplicate direction component"));
        }

        const dirResult = parseDirection(children, idx);
        if (dirResult.ok) {
          hasDirection = true;
          direction = dirResult.value.direction;
          idx = dirResult.value.nextIdx;
          continue;
        }
        // If 'to' is present but the direction is invalid, it's a syntax error.
        // Do not fall back to parsing it as a color.
        return forwardParseErr<Type.LinearGradient>(dirResult);
      }

      // Could be a color stop (named color) - break to color stop parsing
      break;
    }

    // Dimension, Number → angle direction
    if (node.type === "Dimension" || node.type === "Number") {
      if (hasDirection) {
        // Could be a color stop position - break to color stop parsing
        break;
      }
      hasDirection = true;

      const dirResult = parseDirection(children, idx);
      if (dirResult.ok) {
        direction = dirResult.value.direction;
        idx = dirResult.value.nextIdx;
      } else {
        // Not a valid direction, might be color stop
        hasDirection = false;
        break;
      }
      continue;
    }

    // Function (calc/var) → could be angle direction, but be conservative
    if (isCssValueFunction(node)) {
      if (!hasDirection) {
        const funcName = node.type === "Function" ? node.name.toLowerCase() : "";

        // Special case for var(): it's ambiguous
        // Count total comma-separated groups to disambiguate:
        // - 2 groups: var(), var() → both are color stops
        // - 3+ groups: var(), color, color → first is direction
        if (funcName === "var") {
          const allGroups = Utils.Ast.splitNodesByComma(children, { startIndex: 0 });
          if (allGroups.length === 2) {
            // Only 2 items: must be 2 color stops
            break;
          }
        }

        // Try parsing as direction
        const dirResult = parseDirection(children, idx);
        if (dirResult.ok) {
          hasDirection = true;
          direction = dirResult.value.direction;
          idx = dirResult.value.nextIdx;
          continue;
        }
      }
      // Not a direction, must be color stop
      break;
    }

    // Function (color) or Hash → color stop
    if (node.type === "Function" || node.type === "Hash") {
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
        kind: "linear",
        direction,
        colorInterpolationMethod,
        colorStops,
        repeating: isRepeating,
      },
      issues,
    };
  }

  if (colorStops.length < 2) {
    return parseErr(createError("invalid-value", "linear-gradient requires at least 2 color stops"));
  }

  return parseOk({
    kind: "linear",
    direction,
    colorInterpolationMethod,
    colorStops,
    repeating: isRepeating,
  });
}

/**
 * Parse a CSS linear gradient value into IR.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient
 */
export function parse(css: string): ParseResult<Type.LinearGradient> {
  const funcResult = SharedParsing.parseCssToGradientFunction(css, ["linear-gradient", "repeating-linear-gradient"]);
  if (!funcResult.ok) {
    return forwardParseErr<Type.LinearGradient>(funcResult);
  }

  const result = fromFunction(funcResult.value);

  // Add warning if parentheses are unbalanced
  const parenIssue = SharedParsing.validateParentheses(css, "linear");
  if (result.ok && parenIssue) {
    return {
      ...result,
      issues: [...result.issues, parenIssue],
    };
  }

  return result;
}
