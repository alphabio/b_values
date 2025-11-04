// b_path:: packages/b_utils/src/parse/color/test-helpers.ts
import * as csstree from "css-tree";

/**
 * Helper to safely extract a function node from a color declaration
 * Used in tests to avoid TypeScript errors with css-tree types
 */
export function extractFunctionFromDeclaration(input: string): csstree.FunctionNode {
  const ast = csstree.parse(`color: ${input}`, { context: "declarationList" });

  if (ast.type !== "DeclarationList") {
    throw new Error("Expected DeclarationList");
  }

  const declaration = ast.children.first;
  if (declaration?.type !== "Declaration") {
    throw new Error("Expected Declaration");
  }

  const valueNode = declaration.value;
  if (valueNode.type !== "Value") {
    throw new Error("Expected Value node");
  }

  const func = valueNode.children.first;
  if (func?.type !== "Function") {
    throw new Error("Expected Function node");
  }

  return func;
}
