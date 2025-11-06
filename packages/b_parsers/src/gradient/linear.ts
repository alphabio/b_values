// b_path:: packages/b_parsers/src/gradient/linear.ts
import type * as csstree from "css-tree";
import { createError, parseErr, parseOk, forwardParseErr, type ParseResult } from "@b/types";
import type * as Type from "@b/types";
import { parseAngleNode } from "../angle";
import * as ColorStop from "./color-stop";
import * as Utils from "../utils";

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

  if (node.type === "Dimension" || node.type === "Number") {
    const angleResult = parseAngleNode(node);
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
 * Parse linear gradient from CSS function AST.
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

  const firstNode = children[idx];
  if (firstNode) {
    if (
      firstNode.type === "Dimension" ||
      firstNode.type === "Number" ||
      (firstNode.type === "Identifier" && firstNode.name.toLowerCase() === "to")
    ) {
      const dirResult = parseDirection(children, idx);
      if (dirResult.ok) {
        direction = dirResult.value.direction;
        idx = dirResult.value.nextIdx;
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
  const astResult = Utils.Ast.parseCssString(css, "value");
  if (!astResult.ok) {
    return forwardParseErr<Type.LinearGradient>(astResult);
  }

  const funcResult = Utils.Ast.findFunctionNode(astResult.value, ["linear-gradient", "repeating-linear-gradient"]);
  if (!funcResult.ok) {
    return forwardParseErr<Type.LinearGradient>(funcResult);
  }

  return fromFunction(funcResult.value);
}
