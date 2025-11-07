// b_path:: packages/b_parsers/src/math/calc.ts
import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, type ParseResult, type CssValue, type Issue } from "@b/types";
import { parseNodeToCssValue } from "../css-value-parser";

type Operator = "+" | "-" | "*" | "/";
type InfixToken = CssValue | Operator;

const PRECEDENCE: Record<Operator, number> = {
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2,
};

/**
 * Parses a `calc()` expression from AST nodes into a valid expression tree.
 *
 * This implementation uses the Shunting-yard algorithm to correctly handle
 * CSS operator precedence (multiplication/division before addition/subtraction).
 *
 * The process involves three main steps:
 * 1. **Tokenization:** Convert css-tree nodes into an infix list of `CssValue` and `Operator` tokens.
 * 2. **Shunting-yard:** Convert the infix token list to a postfix (Reverse Polish Notation) list.
 * 3. **Tree Building:** Build the final `calc-operation` tree from the postfix list.
 *
 * @param nodes - Array of expression nodes inside `calc()`
 * @returns Result containing the root `CssValue` of the expression tree.
 */
function parseCalcExpression(nodes: csstree.CssNode[]): ParseResult<CssValue> {
  const issues: Issue[] = [];

  // --- Step 1: Tokenize into an Infix expression array ---
  const infix: InfixToken[] = [];
  const expressionNodes = nodes.filter((n) => n.type !== "WhiteSpace");

  for (const node of expressionNodes) {
    if (node.type === "Operator") {
      const op = node.value.trim() as Operator;
      if (PRECEDENCE[op] !== undefined) {
        infix.push(op);
      } else {
        issues.push(createError("invalid-syntax", `Unsupported operator in calc(): ${op}`));
      }
    } else {
      const operandResult = parseNodeToCssValue(node);
      if (operandResult.ok) {
        infix.push(operandResult.value);
        issues.push(...operandResult.issues);
      } else {
        issues.push(...operandResult.issues);
        // If an operand fails to parse, we can't continue building the tree.
        return parseErr(createError("invalid-value", "Invalid operand in calculation"), "calc");
      }
    }
  }

  // --- Step 2: Shunting-yard algorithm (Infix to Postfix/RPN) ---
  const postfix: InfixToken[] = [];
  const operatorStack: Operator[] = [];

  for (const token of infix) {
    if (typeof token === "object") {
      // Token is a CssValue (operand)
      postfix.push(token);
    } else {
      // Token is an Operator
      const op1 = token;
      while (operatorStack.length > 0 && PRECEDENCE[operatorStack[operatorStack.length - 1]] >= PRECEDENCE[op1]) {
        postfix.push(operatorStack.pop()!);
      }
      operatorStack.push(op1);
    }
  }

  while (operatorStack.length > 0) {
    postfix.push(operatorStack.pop()!);
  }

  // --- Step 3: Build Expression Tree from Postfix (RPN) ---
  const buildStack: CssValue[] = [];

  for (const token of postfix) {
    if (typeof token === "object") {
      // Token is a CssValue (operand)
      buildStack.push(token);
    } else {
      // Token is an Operator
      if (buildStack.length < 2) {
        return parseErr(
          createError("invalid-syntax", `Malformed calc expression: missing operands for operator '${token}'`),
          "calc",
        );
      }
      const right = buildStack.pop()!;
      const left = buildStack.pop()!;
      buildStack.push({
        kind: "calc-operation",
        operator: token,
        left,
        right,
      });
    }
  }

  if (buildStack.length !== 1) {
    return parseErr(createError("invalid-syntax", "Malformed calc expression: too many values."), "calc");
  }

  const resultTree = buildStack[0];
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
