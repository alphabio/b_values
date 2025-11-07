// b_path:: packages/b_parsers/src/math/minmax.ts
import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, type ParseResult, type CssValue } from "@b/types";
import { parseNodeToCssValue } from "../utils";
import { splitNodesByComma } from "../utils/ast";

/**
 * Parses min() or max() function from CSS AST.
 *
 * @see https://drafts.csswg.org/css-values-4/#funcdef-min
 * @see https://drafts.csswg.org/css-values-4/#funcdef-max
 */
export function parseMinmaxFunction(
  node: csstree.FunctionNode,
): ParseResult<{ kind: "min" | "max"; values: CssValue[] }> {
  const funcName = node.name.toLowerCase();

  if (funcName !== "min" && funcName !== "max") {
    return parseErr("minmax", createError("invalid-syntax", "Expected min() or max() function"));
  }

  const children = node.children.toArray();
  const groups = splitNodesByComma(children, { trimWhitespace: true });

  if (groups.length < 2) {
    return parseErr("minmax", createError("invalid-syntax", `${funcName}() requires at least two arguments`));
  }

  const values: CssValue[] = [];
  const issues: ReturnType<typeof createError>[] = [];

  // Parse each argument recursively
  for (const group of groups) {
    if (group.length === 0) continue;

    // Handle single-node arguments
    if (group.length === 1) {
      const result = parseNodeToCssValue(group[0]);

      if (result.ok) {
        values.push(result.value);
        issues.push(...result.issues);
      } else {
        issues.push(...result.issues);
        // Preserve partial IR if available
        if (result.value) {
          values.push(result.value);
        }
      }
    } else {
      // Multiple nodes in group (unexpected for simple arguments)
      issues.push(createError("invalid-syntax", `Unexpected multiple nodes in ${funcName}() argument`));

      // Try parsing first node anyway
      const result = parseNodeToCssValue(group[0]);
      if (result.value) {
        values.push(result.value);
      }
    }
  }

  const finalIR = {
    kind: funcName as "min" | "max",
    values,
  };

  if (issues.some((i) => i.severity === "error")) {
    return {
      ok: false,
      value: finalIR,
      issues,
      property: funcName,
    };
  }

  return parseOk(finalIR);
}
