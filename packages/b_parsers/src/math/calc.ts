// b_path:: packages/b_parsers/src/math/calc.ts
import type * as csstree from "css-tree";
import { createError, parseErr, parseOk, type ParseResult, type CssValue } from "@b/types";
import { parseCssValueNodeWrapper } from "../css-value-parser";

/**
 * Parses a calc() expression from AST nodes.
 *
 * Builds a tree of calc-operation nodes respecting operator precedence.
 * NOTE: This is a simplified implementation that builds left-to-right.
 * Full spec-compliant calc() requires proper precedence handling.
 *
 * @param nodes - Array of expression nodes inside calc()
 * @returns Result containing the root CssValue (calc-operation or single value)
 */
function parseCalcExpression(nodes: csstree.CssNode[]): ParseResult<CssValue> {
  const values: CssValue[] = [];
  const operators: Array<"+" | "-" | "*" | "/"> = [];
  const issues: ReturnType<typeof createError>[] = [];

  // Filter out whitespace
  const expressionNodes = nodes.filter((n) => n.type !== "WhiteSpace");

  for (let i = 0; i < expressionNodes.length; i++) {
    const node = expressionNodes[i];

    if (node.type === "Operator") {
      const op = node.value.trim(); // Trim whitespace from operator
      if (op === "+" || op === "-" || op === "*" || op === "/") {
        operators.push(op);
      } else {
        issues.push(createError("invalid-syntax", `Unsupported operator in calc(): ${op}`));
      }
    } else {
      // Recursively parse operands (can be literals, variables, nested calcs)
      const operandResult = parseCssValueNodeWrapper(node);
      if (operandResult.ok) {
        values.push(operandResult.value);
      } else {
        issues.push(...operandResult.issues);
        return parseErr(createError("invalid-value", "Invalid operand in calculation"), "calc");
      }
    }
  }

  // Single value with no operators
  if (values.length === 1 && operators.length === 0) {
    if (issues.length > 0) {
      return { ok: false, value: values[0], issues, property: "calc" };
    }
    return parseOk(values[0]);
  }

  // Validate we have correct structure
  if (values.length <= operators.length) {
    return parseErr(createError("invalid-syntax", "Malformed calc expression: missing operand"), "calc");
  }

  // Build expression tree (simplified left-to-right)
  let resultTree: CssValue = values[0];
  let valueIndex = 1;

  for (const op of operators) {
    const right = values[valueIndex];
    if (!right) {
      return parseErr(createError("invalid-syntax", "Malformed calc expression: missing right operand"), "calc");
    }
    valueIndex++;

    resultTree = {
      kind: "calc-operation",
      operator: op,
      left: resultTree,
      right: right,
    };
  }

  const finalResult: ParseResult<CssValue> = parseOk(resultTree, "calc");
  if (issues.length > 0) {
    finalResult.issues.push(...issues);
  }

  return finalResult;
}

/**
 * Parse calc() function from CSS function AST.
 *
 * @see https://drafts.csswg.org/css-values-4/#calc-func
 */
export function parseCalcFunction(node: csstree.FunctionNode): ParseResult<{ kind: "calc"; value: CssValue }> {
  const funcName = node.name.toLowerCase();

  if (funcName !== "calc") {
    return parseErr(createError("invalid-syntax", "Expected calc() function"));
  }

  const expressionNodes = node.children.toArray();

  if (expressionNodes.length === 0) {
    return parseErr(createError("invalid-syntax", "calc() expression must not be empty"));
  }

  const expressionResult = parseCalcExpression(expressionNodes);

  if (expressionResult.ok) {
    return parseOk({
      kind: "calc",
      value: expressionResult.value,
    });
  }

  // Partial IR on error
  return {
    ok: false,
    value: expressionResult.value ? { kind: "calc", value: expressionResult.value } : undefined,
    issues: expressionResult.issues,
    property: "calc",
  };
}
