// b_path:: packages/b_parsers/src/gradient/color-stop.ts
import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import type * as Type from "@b/types";
import { parseNodeToCssValue } from "../utils";
import * as Color from "../color";

/**
 * Parse color stop or color hint from CSS AST nodes.
 *
 * Color hint: A single length/percentage value representing the midpoint transition.
 * Color stop: A color value optionally followed by 1-2 position values.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient#color-stops
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient#color-hints
 */
export function fromNodes(nodes: csstree.CssNode[]): ParseResult<Type.ColorStopOrHint> {
  if (nodes.length === 0) {
    return parseErr(createError("missing-value", "Color stop requires at least a color value"));
  }

  const firstNode = nodes[0];
  if (!firstNode) {
    return parseErr(createError("missing-value", "Color stop requires at least a color value"));
  }

  // Try parsing as color first
  const colorResult = Color.parseNode(firstNode);

  // If it's not a color and we only have one node, it might be a color hint
  if (!colorResult.ok && nodes.length === 1) {
    // Try parsing as a length/percentage (color hint)
    const hintResult = parseNodeToCssValue(firstNode);
    if (hintResult.ok) {
      const hint = hintResult.value;
      // Validate that it's actually a length-percentage (not just any CSS value)
      // Color hints must be <length-percentage> per CSS spec
      if (
        (hint.kind === "literal" &&
          (hint.unit === "%" ||
            hint.unit === "px" ||
            hint.unit === "em" ||
            hint.unit === "rem" ||
            hint.unit === "vw" ||
            hint.unit === "vh" ||
            hint.unit === "vmin" ||
            hint.unit === "vmax")) ||
        hint.kind === "variable" ||
        hint.kind === "calc"
      ) {
        return parseOk({
          kind: "hint" as const,
          position: hint,
        });
      }
    }
    // Not a color or valid hint
    return parseErr(createError("invalid-value", `Invalid color value: ${colorResult.issues[0]?.message}`));
  }

  // Must be a color stop
  if (!colorResult.ok) {
    return parseErr(createError("invalid-value", `Invalid color value: ${colorResult.issues[0]?.message}`));
  }

  if (nodes.length === 1) {
    return parseOk({ color: colorResult.value });
  }

  // Parse position(s) as CssValue to support var/calc
  const positions: Type.CssValue[] = [];

  for (let i = 1; i < nodes.length; i++) {
    const posNode = nodes[i];
    if (!posNode) continue;

    const posResult = parseNodeToCssValue(posNode);
    if (posResult.ok) {
      positions.push(posResult.value);
    } else {
      return parseErr(createError("invalid-value", `Invalid color stop position: ${posResult.issues[0]?.message}`));
    }
  }

  if (positions.length === 0) {
    return parseOk({ color: colorResult.value });
  }

  if (positions.length === 1) {
    return parseOk({
      color: colorResult.value,
      position: positions[0],
    });
  }

  if (positions.length === 2) {
    return parseOk({
      color: colorResult.value,
      position: [positions[0], positions[1]] as [Type.CssValue, Type.CssValue],
    });
  }

  return parseErr(createError("invalid-value", "Color stop can have at most 2 positions"));
}
