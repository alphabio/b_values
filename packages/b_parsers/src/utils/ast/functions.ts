// b_path:: packages/b_parsers/src/utils/ast/functions.ts
import * as csstree from "css-tree";
import { err, ok, type Result } from "@b/types";

/**
 * Find a function node by name in a CSS AST.
 *
 * Walks the AST to find the first function node with the specified name.
 * Function name matching is case-insensitive to match CSS spec behavior.
 *
 * @param ast - CSS AST to search
 * @param functionNames - Function name(s) to search for (case-insensitive)
 * @returns Result containing FunctionNode or error message
 *
 * @example
 * ```typescript
 * const result = findFunctionNode(ast, ["linear-gradient", "repeating-linear-gradient"]);
 * if (result.ok) {
 *   console.log(result.value.name); // "linear-gradient"
 * }
 * ```
 */
export function findFunctionNode(
  ast: csstree.CssNode,
  functionNames: string | string[],
): Result<csstree.FunctionNode, string> {
  const names = Array.isArray(functionNames) ? functionNames : [functionNames];
  const lowerNames = names.map((name) => name.toLowerCase());
  let foundNode: csstree.FunctionNode | null = null;

  try {
    csstree.walk(ast, {
      visit: "Function",
      enter(node: csstree.FunctionNode) {
        if (lowerNames.includes(node.name.toLowerCase())) {
          foundNode = node;
        }
      },
    });

    if (!foundNode) {
      return err(`No function found with name(s): ${names.join(", ")}`);
    }

    return ok(foundNode);
  } catch (e) {
    return err(`Failed to search AST: ${e instanceof Error ? e.message : String(e)}`);
  }
}

/**
 * Parse CSS string into AST with error handling.
 *
 * @param css - CSS string to parse
 * @param context - CSS parsing context ("value", "declaration", etc.)
 * @returns Result containing CSS AST or error message
 *
 * @example
 * ```typescript
 * const result = parseCssString("linear-gradient(red, blue)", "value");
 * if (result.ok) {
 *   // Work with AST
 * }
 * ```
 */
export function parseCssString(
  css: string,
  context: "value" | "declaration" = "value",
): Result<csstree.CssNode, string> {
  try {
    const ast = csstree.parse(css, { context });
    return ok(ast);
  } catch (e) {
    return err(`Failed to parse CSS: ${e instanceof Error ? e.message : String(e)}`);
  }
}
