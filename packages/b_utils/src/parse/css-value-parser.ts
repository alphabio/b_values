// b_path:: packages/b_utils/src/parse/css-value-parser.ts
import * as csstree from "@eslint/css-tree";
import { createError, forwardParseErr, parseErr, parseOk, type ParseResult } from "@b/types";
import type { CssValue } from "@b/types";

/**
 * Generic CSS value parser (NO complex function support).
 * 
 * ⚠️ **IMPORTANT**: Property parsers should use `@b/parsers/parseNodeToCssValue` instead.
 * 
 * This low-level parser does NOT handle complex CSS functions:
 * - Gradients: linear-gradient(), radial-gradient(), conic-gradient()
 * - Colors: rgb(), hsl(), lab(), lch(), oklch(), oklab(), color()
 * - Math: calc(), min(), max(), clamp()
 * 
 * It only handles:
 * - Basic values: numbers, dimensions, percentages, keywords
 * - var() with fallback parsing
 * - String literals
 * - Hex colors
 * - Generic function calls (as opaque CssValue)
 * 
 * @internal Use via @b/parsers for property parsing
 */
export function parseCssValueNode(node: csstree.CssNode): ParseResult<CssValue> {
  switch (node.type) {
    case "Number": {
      const value = Number.parseFloat(node.value);
      if (Number.isNaN(value)) {
        return parseErr("number", createError("invalid-value", "Invalid number value"));
      }
      return parseOk({ kind: "literal", value });
    }

    case "Percentage": {
      const value = Number.parseFloat(node.value);
      if (Number.isNaN(value)) {
        return parseErr("percentage", createError("invalid-value", "Invalid percentage value"));
      }
      return parseOk({ kind: "literal", value, unit: "%" });
    }

    case "Dimension": {
      const value = Number.parseFloat(node.value);
      if (Number.isNaN(value)) {
        return parseErr("length", createError("invalid-value", "Invalid dimension value"));
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
          return parseErr(
            "var()",
            createError("invalid-syntax", "Invalid var() function: missing custom property name"),
          );
        }

        if (varNameNode.type !== "Identifier" || !varNameNode.name.startsWith("--")) {
          return parseErr(
            "var()",
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
              "var()",
              createError("invalid-syntax", "Invalid var() function: missing fallback value after comma"),
            );
          }

          // Handle Raw nodes - css-tree sometimes parses fallback values as Raw
          const firstNode = fallbackNodes[0];
          if (firstNode.type === "Raw") {
            // Parse the raw string as a CSS value
            try {
              const rawAst = csstree.parse(firstNode.value.trim(), { context: "value" });
              // biome-ignore lint/suspicious/noExplicitAny: css-tree List type not exposed in type definitions
              const rawChildren = (rawAst as any).children?.toArray();
              if (rawChildren && rawChildren.length > 0) {
                const fallbackResult = parseCssValueNode(rawChildren[0]);
                if (!fallbackResult.ok) {
                  return fallbackResult;
                }
                fallback = fallbackResult.value;
              }
            } catch {
              // If parsing fails, treat as invalid
              return parseErr(
                "var()",
                createError("invalid-syntax", `Invalid var() fallback value: ${firstNode.value}`),
              );
            }
          } else {
            // RECURSION: Parse the content of the fallback argument
            const fallbackResult = parseCssValueNode(firstNode);
            if (!fallbackResult.ok) {
              return fallbackResult;
            }
            fallback = fallbackResult.value;
          }
        }

        return parseOk({
          kind: "variable",
          name: varName,
          ...(fallback && { fallback }),
        });
      }

      // 2. FALLBACK: Generic Function Call (for all other functions)
      // NOTE: Complex functions (calc, rgb, etc.) should be handled by calling
      // parseNodeToCssValue from @b/parsers instead of this function directly.
      // This fallback handles unknown functions generically.
      const args: CssValue[] = [];
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

    // Hash nodes (#RRGGBB) represent hex colors
    // Property-specific color parsers handle full Color IR;
    // this handles generic hex color values
    case "Hash": {
      const value = node.value.toLowerCase();
      return parseOk({ kind: "hex-color", value: `#${value}` });
    }

    default: {
      return parseErr("css-value", createError("unsupported-kind", `Unsupported node type: ${node.type}`));
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
