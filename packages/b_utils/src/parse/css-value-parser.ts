// b_path:: packages/b_utils/src/parse/css-value-parser.ts
import type * as csstree from "css-tree";
import { createError, forwardParseErr, parseErr, parseOk, type ParseResult } from "@b/types";
import type { CssValue } from "@b/types";

/**
 * Parse a CSS node into a CssValue.
 * Handles numbers, dimensions, percentages, keywords, and var() functions.
 */

/**
 * Parse a CSS node into a CssValue.
 * Handles numbers, dimensions, percentages, keywords, var(),
 * string literals, and falls back to generic function calls for all others.
 */
export function parseCssValueNode(node: csstree.CssNode): ParseResult<CssValue> {
  switch (node.type) {
    case "Number": {
      const value = Number.parseFloat(node.value);
      if (Number.isNaN(value)) {
        return parseErr(createError("invalid-value", "Invalid number value"));
      }
      return parseOk({ kind: "literal", value });
    }

    case "Percentage": {
      const value = Number.parseFloat(node.value);
      if (Number.isNaN(value)) {
        return parseErr(createError("invalid-value", "Invalid percentage value"));
      }
      return parseOk({ kind: "literal", value, unit: "%" });
    }

    case "Dimension": {
      const value = Number.parseFloat(node.value);
      if (Number.isNaN(value)) {
        return parseErr(createError("invalid-value", "Invalid dimension value"));
      }
      return parseOk({ kind: "literal", value, unit: node.unit });
    }

    // --- NEW: Handle String Literals ---
    case "String": {
      // css-tree already removes the surrounding quotes
      return parseOk({ kind: "string", value: node.value });
    }
    // --- END NEW ---

    case "Identifier": {
      return parseOk({ kind: "keyword", value: node.name });
    }

    case "Function": {
      const funcName = node.name.toLowerCase();
      const children = node.children.toArray();

      // 1. Handle var() (Needs special inline parsing due to fallback)
      if (funcName === "var") {
        const varNameNode = children.find((n) => n.type !== "WhiteSpace");

        if (!varNameNode) {
          return parseErr(createError("invalid-syntax", "Invalid var() function: missing custom property name"));
        }

        if (varNameNode.type !== "Identifier" || !varNameNode.name.startsWith("--")) {
          return parseErr(
            createError(
              "invalid-syntax",
              `Invalid var() function: expected a custom property name (--*), got ${varNameNode.type}`,
            ),
          );
        }

        const varName = varNameNode.name;
        let fallback: CssValue | undefined;
        const commaIndex = children.findIndex((n) => n.type === "Operator" && n.value === ",");

        // Handle fallback logic
        if (commaIndex !== -1) {
          const fallbackNodes = children.slice(commaIndex + 1).filter((n) => n.type !== "WhiteSpace");

          if (fallbackNodes.length === 0) {
            return parseErr(
              createError("invalid-syntax", "Invalid var() function: missing fallback value after comma"),
            );
          }

          // RECURSION: Parse the content of the fallback argument
          // In complex scenarios, the fallback might be a list,
          // but we take the first node for simple fallbacks.
          const fallbackResult = parseCssValueNode(fallbackNodes[0]);
          if (!fallbackResult.ok) {
            return fallbackResult;
          }
          fallback = fallbackResult.value;
        }

        return parseOk({
          kind: "variable",
          name: varName,
          ...(fallback && { fallback }),
        });

        // 2. Handle all other functions as a Generic Function Call
        //    (This unblocks recursive parsing for calc, min, rgb, etc.)
        //    Note: Special functions like calc() should ideally be parsed by
        //    a dedicated function *before* this point or delegated dynamically.
        //    Since they recursively use parseCssValueNode, returning them as
        //    functionCallSchema here might lose their semantic structure,
        //    but it stops the fatal error.
      }

      // When a complex function (calc, rgb) is an argument, the logic should be:
      // Inside parseRgbFunction: Call to parseCssValueNode(calcNode)

      // Since we cannot safely delegate to complex parsers here due to dependency issues,
      // we must implement the generic function parsing now, and rely on the consuming
      // code (like argument validation in RGB, HSL) to handle semantic checks.

      const args: CssValue[] = [];
      // Filter out commas and whitespace from arguments
      const argumentNodes = children.filter((n) => n.type !== "WhiteSpace" && n.type !== "Operator");

      for (const child of argumentNodes) {
        // RECURSION: This handles the nested primitives or other functions inside
        const argResult = parseCssValueNode(child);
        if (argResult.ok) {
          args.push(argResult.value);
        } else {
          return forwardParseErr<CssValue>(argResult);
        }
      }

      return parseOk({ kind: "function", name: node.name, args: args });
    }

    // Hash nodes (#RRGGBB) are typically handled by Color.parseNode, but if CssValue
    // is called on a standalone hash, treat it as a keyword for now
    case "Hash": {
      const value = node.value.toLowerCase();
      return parseOk({ kind: "keyword", value: `#${value}` });
    }

    default: {
      return parseErr(createError("unsupported-kind", `Unsupported node type: ${node.type}`));
    }
  }
}

/**
 * Extract non-whitespace children from a function node
 */
export function getChildren(node: csstree.FunctionNode): csstree.CssNode[] {
  const children: csstree.CssNode[] = [];
  node.children.forEach((child) => {
    if (child.type !== "WhiteSpace") {
      children.push(child);
    }
  });
  return children;
}

/**
 * Extract values from children, filtering out operator nodes
 */
export function getValues(children: csstree.CssNode[]): csstree.CssNode[] {
  const values: csstree.CssNode[] = [];
  for (const child of children) {
    if (child.type !== "Operator") {
      values.push(child);
    }
  }
  return values;
}
