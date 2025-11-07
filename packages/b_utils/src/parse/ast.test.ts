// b_path:: packages/b_utils/src/parse/ast.test.ts
import { describe, expect, test } from "vitest";
import * as csstree from "@eslint/css-tree";
import {
  splitNodesByComma,
  isFunctionNode,
  isIdentifier,
  isDimension,
  isPercentage,
  isNumber,
  nodeListToArray,
} from "./ast";

describe("splitNodesByComma", () => {
  test("splits simple comma-separated values", () => {
    const ast = csstree.parse("red, blue, green", { context: "value" }) as csstree.Value;
    const nodes = ast.children.toArray();
    const groups = splitNodesByComma(nodes);

    expect(groups).toHaveLength(3);
    expect(groups[0]).toHaveLength(1);
    expect(groups[1]).toHaveLength(1);
    expect(groups[2]).toHaveLength(1);
  });

  test("handles nested functions correctly", () => {
    const ast = csstree.parse("calc(50% + 10px), rgba(0,0,0,0.5), blue", {
      context: "value",
    }) as csstree.Value;
    const nodes = ast.children.toArray();
    const groups = splitNodesByComma(nodes);

    // Should split by top-level commas, not commas inside functions
    expect(groups).toHaveLength(3);
    expect(groups[0][0].type).toBe("Function"); // calc
    expect(groups[1][0].type).toBe("Function"); // rgba
    expect(groups[2][0].type).toBe("Identifier"); // blue
  });

  test("handles single value without commas", () => {
    const ast = csstree.parse("red", { context: "value" }) as csstree.Value;
    const nodes = ast.children.toArray();
    const groups = splitNodesByComma(nodes);

    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveLength(1);
  });

  test("handles empty array", () => {
    const groups = splitNodesByComma([]);
    expect(groups).toHaveLength(0);
  });

  test("handles trailing comma", () => {
    const ast = csstree.parse("red, blue,", { context: "value" }) as csstree.Value;
    const nodes = ast.children.toArray();
    const groups = splitNodesByComma(nodes);

    // Should ignore trailing comma
    expect(groups).toHaveLength(2);
  });
});

describe("Type guards", () => {
  test("isFunctionNode identifies function nodes", () => {
    const ast = csstree.parse("calc(50% + 10px)", { context: "value" }) as csstree.Value;
    const node = ast.children.first!;

    expect(isFunctionNode(node)).toBe(true);
    expect(isFunctionNode(node, "calc")).toBe(true);
    expect(isFunctionNode(node, "rgba")).toBe(false);
  });

  test("isIdentifier identifies identifier nodes", () => {
    const ast = csstree.parse("red", { context: "value" }) as csstree.Value;
    const node = ast.children.first!;

    expect(isIdentifier(node)).toBe(true);
    expect(isIdentifier(node, "red")).toBe(true);
    expect(isIdentifier(node, "blue")).toBe(false);
  });

  test("isDimension identifies dimension nodes", () => {
    const ast = csstree.parse("10px", { context: "value" }) as csstree.Value;
    const node = ast.children.first!;

    expect(isDimension(node)).toBe(true);
  });

  test("isPercentage identifies percentage nodes", () => {
    const ast = csstree.parse("50%", { context: "value" }) as csstree.Value;
    const node = ast.children.first!;

    expect(isPercentage(node)).toBe(true);
  });

  test("isNumber identifies number nodes", () => {
    const ast = csstree.parse("0.5", { context: "value" }) as csstree.Value;
    const node = ast.children.first!;

    expect(isNumber(node)).toBe(true);
  });
});

describe("nodeListToArray", () => {
  test("converts css-tree list to array", () => {
    const ast = csstree.parse("red, blue, green", { context: "value" }) as csstree.Value;
    const array = nodeListToArray(ast.children);

    expect(Array.isArray(array)).toBe(true);
    expect(array.length).toBeGreaterThan(0);
  });
});
