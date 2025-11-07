// b_path:: packages/b_parsers/src/math/clamp.ts
import type * as csstree from "css-tree";
import { createError, parseErr, parseOk, type ParseResult, type CssValue } from "@b/types";
import { parseCssValueNodeWrapper } from "../css-value-parser";
import { splitNodesByComma } from "../utils/ast";

/**
 * Parses clamp() function from CSS AST.
 *
 * @see https://drafts.csswg.org/css-values-4/#funcdef-clamp
 */
export function parseClampFunction(
  node: csstree.FunctionNode,
): ParseResult<{ kind: "clamp"; min: CssValue; preferred: CssValue; max: CssValue }> {
  if (node.name.toLowerCase() !== "clamp") {
    return parseErr(createError("invalid-syntax", "Expected clamp() function"));
  }

  const children = node.children.toArray();
  const groups = splitNodesByComma(children, { trimWhitespace: true });

  if (groups.length !== 3) {
    return parseErr(createError("invalid-syntax", "clamp() requires exactly three arguments: min, preferred, max"));
  }

  const args: CssValue[] = [];
  const issues: ReturnType<typeof createError>[] = [];

  // Parse min, preferred, max arguments
  for (let i = 0; i < 3; i++) {
    const group = groups[i];

    if (group.length !== 1 || !group[0]) {
      issues.push(createError("invalid-syntax", `clamp() argument ${i + 1} must be a single value`));
      // Push placeholder to maintain structure
      args.push({ kind: "keyword", value: "invalid" });
      continue;
    }

    const result = parseCssValueNodeWrapper(group[0]);

    if (result.ok) {
      args.push(result.value);
      issues.push(...result.issues);
    } else {
      issues.push(...result.issues);
      // Preserve partial IR if available
      args.push(result.value || { kind: "keyword", value: "error" });
    }
  }

  if (args.length !== 3) {
    return parseErr(createError("invalid-value", "Failed to parse all three arguments for clamp()"));
  }

  const [min, preferred, max] = args;

  const finalIR = {
    kind: "clamp" as const,
    min,
    preferred,
    max,
  };

  if (issues.some((i) => i.severity === "error")) {
    return {
      ok: false,
      value: finalIR,
      issues,
      property: "clamp",
    };
  }

  return parseOk(finalIR);
}
