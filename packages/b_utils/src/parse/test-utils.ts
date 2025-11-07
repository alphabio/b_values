// b_path:: packages/b_utils/src/parse/test-utils.ts
import * as csstree from "@eslint/css-tree";

/**
 * Extract a function node from a CSS function string for testing
 *
 * @param input - CSS function string (e.g., "rgb(255 0 0)", "calc(100% - 20px)")
 * @returns The parsed FunctionNode
 * @throws Error if parsing fails or result is not a function
 */
export function extractFunctionFromValue(input: string): csstree.FunctionNode {
  const ast = csstree.parse(input, { context: "value" });

  if (ast.type !== "Value") {
    throw new Error("Expected Value node");
  }

  const func = ast.children.first;
  if (func?.type !== "Function") {
    throw new Error(`Expected Function node, got ${func?.type}`);
  }

  return func;
}
