// b_path:: packages/b_parsers/src/background/repeat.ts

import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import * as Ast from "@b/utils";

const REPETITION_VALUES = ["repeat", "space", "round", "no-repeat"] as const;
type RepetitionValue = (typeof REPETITION_VALUES)[number];

type RepeatStyle =
  | { kind: "shorthand"; value: "repeat-x" | "repeat-y" }
  | { kind: "explicit"; horizontal: RepetitionValue; vertical: RepetitionValue };

/**
 * Parse a single background-repeat value from a CSS AST node.
 *
 * Syntax: repeat-x | repeat-y | [ repeat | space | round | no-repeat ]{1,2}
 *
 * @param valueNode - The Value node containing the repeat value
 * @returns ParseResult with RepeatStyle
 */
export function parseBackgroundRepeatValue(valueNode: csstree.Value): ParseResult<RepeatStyle> {
  const allNodes = Ast.nodeListToArray(valueNode.children);
  const nodes = allNodes.filter((node) => node.type !== "WhiteSpace");

  if (nodes.length === 0) {
    return parseErr("background-repeat", createError("invalid-syntax", "Expected repeat value"));
  }

  if (nodes.length > 2) {
    return parseErr("background-repeat", createError("invalid-syntax", "Too many values for repeat style (max 2)"));
  }

  const firstNode = nodes[0];
  if (!firstNode || !Ast.isIdentifier(firstNode)) {
    return parseErr("background-repeat", createError("invalid-syntax", "Expected repeat value"));
  }

  const firstValue = firstNode.name.toLowerCase();

  // Check for shorthand
  if (firstValue === "repeat-x") {
    return parseOk({ kind: "shorthand", value: "repeat-x" });
  }
  if (firstValue === "repeat-y") {
    return parseOk({ kind: "shorthand", value: "repeat-y" });
  }

  // Parse explicit form
  if (!REPETITION_VALUES.includes(firstValue as RepetitionValue)) {
    return parseErr(
      "background-repeat",
      createError(
        "invalid-value",
        `Invalid repeat value: '${firstValue}'. Expected: repeat, space, round, no-repeat, repeat-x, or repeat-y`,
      ),
    );
  }

  const horizontal = firstValue as RepetitionValue;

  // Check for second value
  if (nodes.length === 1) {
    // Single value - apply to both axes
    return parseOk({
      kind: "explicit",
      horizontal,
      vertical: horizontal,
    });
  }

  // Two values
  const secondNode = nodes[1];
  if (!secondNode || !Ast.isIdentifier(secondNode)) {
    return parseErr(
      "background-repeat",
      createError("invalid-syntax", `Expected second repeat value, got ${secondNode?.type}`),
    );
  }

  const secondValue = secondNode.name.toLowerCase();
  if (!REPETITION_VALUES.includes(secondValue as RepetitionValue)) {
    return parseErr(
      "background-repeat",
      createError(
        "invalid-value",
        `Invalid repeat value: '${secondValue}'. Expected: repeat, space, round, or no-repeat`,
      ),
    );
  }

  return parseOk({
    kind: "explicit",
    horizontal,
    vertical: secondValue as RepetitionValue,
  });
}
