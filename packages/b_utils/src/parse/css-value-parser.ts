// b_path:: packages/b_utils/src/parse/css-value-parser.ts
import type * as csstree from "css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import type { CssValue } from "@b/types";

/**
 * Parse a CSS node into a CssValue.
 * Handles numbers, dimensions, percentages, keywords, and var() functions.
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

    case "Identifier": {
      return parseOk({ kind: "keyword", value: node.name });
    }

    case "Function": {
      // We only handle var() for now.
      if (node.name.toLowerCase() !== "var") {
        return parseErr(createError("unsupported-kind", `Unsupported function: ${node.name}`));
      }

      const children = node.children.toArray();
      const varNameNode = children[0];

      // 1. Guard against an empty var() function like `var()`
      if (!varNameNode) {
        return parseErr(createError("invalid-syntax", "Invalid var() function: missing custom property name"));
      }

      // 2. Check if the varNameNode is an Identifier with a name starting with '--'
      if (varNameNode.type !== "Identifier" || !varNameNode.name.startsWith("--")) {
        return parseErr(
          createError(
            "invalid-syntax",
            `Invalid var() function: expected a custom property name (--*), got ${varNameNode.type}`,
          ),
        );
      }

      // Now TypeScript knows it's an Identifier, so you can safely access its properties.
      const varName = varNameNode.name;

      let fallback: CssValue | undefined;

      // The fallback consists of a comma and then the value node.
      // children[0] is the name, children[1] is the comma.
      if (children.length > 1) {
        if (children[1].type !== "Operator" || children[1].value !== ",") {
          return parseErr(
            createError("invalid-syntax", "Invalid var() function: expected a comma before the fallback value"),
          );
        }

        const fallbackNode = children[2];
        if (!fallbackNode) {
          return parseErr(createError("invalid-syntax", "Invalid var() function: missing fallback value after comma"));
        }

        // RECURSION: Parse the fallback node.
        const fallbackResult = parseCssValueNode(fallbackNode);
        if (!fallbackResult.ok) {
          return fallbackResult; // Propagate the parsing error from the fallback.
        }
        fallback = fallbackResult.value;
      }

      return parseOk({
        kind: "variable",
        name: varName,
        ...(fallback && { fallback }),
      });
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
