// b_path:: packages/b_parsers/src/color/color.ts
import * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import type * as Type from "@b/types";
import { parseNodeToCssValue } from "../utils";
import { parseRgbFunction } from "./rgb";
import { parseHslFunction } from "./hsl";
import { parseHwbFunction } from "./hwb";
import { parseLabFunction } from "./lab";
import { parseLchFunction } from "./lch";
import { parseOklabFunction } from "./oklab";
import { parseOklchFunction } from "./oklch";
import { parseColorFunction } from "./color-function";

/**
 * Parse color AST node with auto-detection.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
 */
export function parseNode(node: csstree.CssNode): ParseResult<Type.Color> {
  if (node.type === "Hash") {
    const value = node.value.toLowerCase();
    // Validate hex color format (3, 4, 6, or 8 hex digits)
    const hexPattern = /^[0-9a-f]{3}$|^[0-9a-f]{4}$|^[0-9a-f]{6}$|^[0-9a-f]{8}$/;
    if (!hexPattern.test(value)) {
      return parseErr("color", createError("invalid-value", `Invalid hex color: #${value}`));
    }
    return parseOk({ kind: "hex", value: `#${value}` } as Type.Color);
  }

  if (node.type === "Function") {
    const funcName = node.name.toLowerCase();

    // Handle var() which can represent any color
    if (funcName === "var") {
      const result = parseNodeToCssValue(node);
      if (result.ok && result.value.kind === "variable") {
        return parseOk(result.value as Type.Color);
      }
      return result as ParseResult<Type.Color>;
    }

    switch (funcName) {
      case "rgb":
      case "rgba":
        return parseRgbFunction(node);
      case "hsl":
      case "hsla":
        return parseHslFunction(node);
      case "hwb":
        return parseHwbFunction(node);
      case "lab":
        return parseLabFunction(node);
      case "lch":
        return parseLchFunction(node);
      case "oklab":
        return parseOklabFunction(node);
      case "oklch":
        return parseOklchFunction(node);
      case "color":
        return parseColorFunction(node);
      default:
        return parseErr("color", createError("unsupported-kind", `Unsupported color function: ${funcName}`));
    }
  }

  if (node.type === "Identifier") {
    const keyword = node.name.toLowerCase();

    if (keyword === "transparent" || keyword === "currentcolor") {
      return parseOk({ kind: "special", keyword } as Type.Color);
    }

    return parseOk({ kind: "named", name: keyword } as Type.Color);
  }

  return parseErr("color", createError("invalid-syntax", `Invalid color node type: ${node.type}`));
}

/**
 * Parse color value string with auto-detection.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
 */
export function parse(value: string): ParseResult<Type.Color> {
  try {
    const ast = csstree.parse(value, { context: "value" });

    let firstNode: csstree.CssNode | null = null;
    csstree.walk(ast, {
      enter(node: csstree.CssNode) {
        if (!firstNode && node.type !== "Value") {
          firstNode = node;
        }
      },
    });

    if (!firstNode) {
      return parseErr("color", createError("invalid-syntax", "Empty value"));
    }

    return parseNode(firstNode);
  } catch (e) {
    return parseErr(
      "color",
      createError("invalid-syntax", `Failed to parse color: ${e instanceof Error ? e.message : String(e)}`),
    );
  }
}
