// b_path:: packages/b_parsers/src/position.ts
import type * as csstree from "css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import type * as Type from "@b/types";
import { parseCssValueNodeWrapper } from "./css-value-parser";

/**
 * Parse 2D position from array of AST nodes.
 * Supports 1, 2, 3, and 4-value position syntax.
 *
 * @see https://drafts.csswg.org/css-backgrounds-3/#typedef-bg-position
 */
export function parsePosition2D(
  nodes: csstree.CssNode[],
  startIdx: number,
): ParseResult<{ position: Type.Position2D; nextIdx: number }> {
  let idx = startIdx;

  if (idx >= nodes.length) {
    return parseErr(createError("invalid-syntax", "Expected position value"));
  }

  // Collect all position values
  const positionValues: Type.CssValue[] = [];
  while (idx < nodes.length && nodes[idx]?.type !== "Operator") {
    const node = nodes[idx];
    if (!node) break;

    const value = parseCssValueNodeWrapper(node);
    if (!value.ok) break;

    positionValues.push(value.value);
    idx++;
  }

  if (positionValues.length === 0) {
    return parseErr(createError("invalid-syntax", "Expected position value"));
  }

  // Parse based on number of values
  const result = parsePositionValues(positionValues);
  if (!result.ok) {
    return parseErr(result.issues[0] ?? createError("invalid-syntax", "Failed to parse position"));
  }

  return parseOk({ position: result.value, nextIdx: idx });
}

/**
 * Parse position values based on count (1, 2, 3, or 4 values)
 */
function parsePositionValues(values: Type.CssValue[]): ParseResult<Type.Position2D> {
  switch (values.length) {
    case 1:
      return parse1Value(values);
    case 2:
      return parse2Value(values);
    case 3:
      return parse3Value(values);
    case 4:
      return parse4Value(values);
    default:
      return parseErr(createError("invalid-syntax", `Invalid position syntax: ${values.length} values`));
  }
}

/**
 * Parse 1-value syntax: center | left | top | 50%
 */
function parse1Value(values: Type.CssValue[]): ParseResult<Type.Position2D> {
  const val = values[0];
  if (!val) return parseErr(createError("invalid-syntax", "Missing position value"));

  // Handle axis-specific keywords
  if (val.kind === "keyword") {
    if (val.value === "top" || val.value === "bottom") {
      return parseOk({
        horizontal: { kind: "keyword", value: "center" },
        vertical: val,
      });
    }
    if (val.value === "left" || val.value === "right") {
      return parseOk({
        horizontal: val,
        vertical: { kind: "keyword", value: "center" },
      });
    }
    // center
    return parseOk({
      horizontal: val,
      vertical: { kind: "keyword", value: "center" },
    });
  }

  // Assume horizontal
  return parseOk({
    horizontal: val,
    vertical: { kind: "keyword", value: "center" },
  });
}

/**
 * Parse 2-value syntax: left top | 50% 75%
 */
function parse2Value(values: Type.CssValue[]): ParseResult<Type.Position2D> {
  const h = values[0];
  const v = values[1];
  if (!h || !v) return parseErr(createError("invalid-syntax", "Missing position values"));

  return parseOk({ horizontal: h, vertical: v });
}

/**
 * Parse 3-value syntax: left 15% top | center top 20px | right 10% center
 */
function parse3Value(values: Type.CssValue[]): ParseResult<Type.Position2D> {
  const v0 = values[0];
  const v1 = values[1];
  const v2 = values[2];
  if (!v0 || !v1 || !v2) return parseErr(createError("invalid-syntax", "Missing position values"));

  // Pattern 1: [edge] [offset] [keyword/edge]
  const edge1 = getEdgeKeyword(v0);
  if (edge1) {
    // First pair is edge+offset
    const isHorizontal1 = edge1 === "left" || edge1 === "right";

    // Check if v2 is also an edge
    const edge2 = getEdgeKeyword(v2);
    if (edge2) {
      const isHorizontal2 = edge2 === "left" || edge2 === "right";
      if (isHorizontal1 === isHorizontal2) {
        return parseErr(createError("invalid-syntax", "Both edges on same axis"));
      }
    }

    // v2 can be any keyword (edge or center)
    if (isHorizontal1) {
      return parseOk({
        horizontal: { edge: edge1, offset: v1 },
        vertical: v2,
      });
    }
    return parseOk({
      horizontal: v2,
      vertical: { edge: edge1, offset: v1 },
    });
  }

  // Pattern 2: [keyword] [edge] [offset] - e.g., center top 20px
  const edge2Alt = getEdgeKeyword(v1);
  if (edge2Alt) {
    const isHorizontal = edge2Alt === "left" || edge2Alt === "right";
    if (isHorizontal) {
      return parseOk({
        horizontal: { edge: edge2Alt, offset: v2 },
        vertical: v0,
      });
    }
    return parseOk({
      horizontal: v0,
      vertical: { edge: edge2Alt, offset: v2 },
    });
  }

  return parseErr(createError("invalid-syntax", "Invalid 3-value position syntax"));
}

/**
 * Parse 4-value syntax: left 15% top 20px
 */
function parse4Value(values: Type.CssValue[]): ParseResult<Type.Position2D> {
  const v0 = values[0];
  const v1 = values[1];
  const v2 = values[2];
  const v3 = values[3];
  if (!v0 || !v1 || !v2 || !v3) {
    return parseErr(createError("invalid-syntax", "Missing position values"));
  }

  // Pattern: [edge] [offset] [edge] [offset]
  const edge1 = getEdgeKeyword(v0);
  const edge2 = getEdgeKeyword(v2);

  if (!edge1 || !edge2) {
    return parseErr(createError("invalid-syntax", "Expected edge keywords at positions 1 and 3"));
  }

  // Determine which pair is horizontal vs vertical
  const isHorizontal1 = edge1 === "left" || edge1 === "right";
  const isHorizontal2 = edge2 === "left" || edge2 === "right";

  if (isHorizontal1 === isHorizontal2) {
    return parseErr(createError("invalid-syntax", "Both pairs on same axis"));
  }

  if (isHorizontal1) {
    return parseOk({
      horizontal: { edge: edge1, offset: v1 },
      vertical: { edge: edge2, offset: v3 },
    });
  }
  return parseOk({
    horizontal: { edge: edge2, offset: v3 },
    vertical: { edge: edge1, offset: v1 },
  });
}

/**
 * Get edge keyword from a CssValue, or undefined if not an edge keyword
 */
function getEdgeKeyword(value: Type.CssValue): "left" | "right" | "top" | "bottom" | undefined {
  if (value.kind === "keyword") {
    const kw = value.value;
    if (kw === "left" || kw === "right" || kw === "top" || kw === "bottom") {
      return kw;
    }
  }
  return undefined;
}
