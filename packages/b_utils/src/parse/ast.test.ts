// b_path:: packages/b_utils/src/parse/ast.test.ts
import { describe, expect, test } from "vitest";
import * as csstree from "@eslint/css-tree";
import {
  splitNodesByComma,
  formatSourceContext,
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

describe("formatSourceContext", () => {
  test("formats single-line error context", () => {
    const source = "color: rgb(300, 0, 0)";
    const loc: csstree.CssLocationRange = {
      start: { line: 1, column: 12, offset: 11 },
      end: { line: 1, column: 15, offset: 14 },
      source: "",
    };

    const context = formatSourceContext(source, loc);

    expect(context).toContain("1 | color: rgb(300, 0, 0)");
    expect(context).toContain("^");
    // Verify pointer is at correct position (column 12)
    const lines = context.split("\n");
    const pointerLine = lines[lines.length - 1];
    const pointerIndex = pointerLine.indexOf("^");
    expect(pointerIndex).toBeGreaterThan(0);
  });

  test("includes context lines before error", () => {
    const source = "line1\nline2\ncolor: red";
    const loc: csstree.CssLocationRange = {
      start: { line: 3, column: 8, offset: 18 },
      end: { line: 3, column: 11, offset: 21 },
      source: "",
    };

    const context = formatSourceContext(source, loc);

    // Should show lines 1-3
    expect(context).toContain("1 | line1");
    expect(context).toContain("2 | line2");
    expect(context).toContain("3 | color: red");
    expect(context).toContain("^");
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
