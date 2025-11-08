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
  getNodeLocation,
  convertLocation,
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

describe("getNodeLocation", () => {
  test("returns location when available", () => {
    const ast = csstree.parse("red", {
      context: "value",
      positions: true,
    }) as csstree.Value;
    const node = ast.children.first!;

    const location = getNodeLocation(node);
    expect(location).toBeDefined();
    expect(location).toHaveProperty("start");
    expect(location).toHaveProperty("end");
  });

  test("returns undefined when location not available", () => {
    const ast = csstree.parse("red", { context: "value" }) as csstree.Value;
    const node = ast.children.first!;

    const location = getNodeLocation(node);
    expect(location).toBeUndefined();
  });
});

describe("convertLocation", () => {
  test("returns undefined when location is undefined", () => {
    const result = convertLocation(undefined, "test source");
    expect(result).toBeUndefined();
  });

  test("returns undefined when source is undefined", () => {
    const mockLoc: csstree.CssLocationRange = {
      source: "test",
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 4, offset: 3 },
    };
    const result = convertLocation(mockLoc, undefined);
    expect(result).toBeUndefined();
  });

  test("calculates offset and length for single line", () => {
    const mockLoc = {
      source: "test",
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 4, offset: 3 },
    };
    const source = "red";

    const result = convertLocation(mockLoc, source);
    expect(result).toEqual({
      offset: 0,
      length: 3,
    });
  });

  test("calculates offset and length for multiple lines", () => {
    const mockLoc = {
      source: "test",
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 2, column: 4, offset: 8 },
    };
    const source = "red\nblue";

    const result = convertLocation(mockLoc, source);
    expect(result).toEqual({
      offset: 0,
      length: 7,
    });
  });

  test("calculates offset with column offset on first line", () => {
    const mockLoc = {
      source: "test",
      start: { line: 1, column: 5, offset: 4 },
      end: { line: 1, column: 8, offset: 7 },
    };
    const source = "    red";

    const result = convertLocation(mockLoc, source);
    expect(result).toEqual({
      offset: 4,
      length: 3,
    });
  });

  test("handles complex multi-line location", () => {
    const mockLoc = {
      source: "test",
      start: { line: 2, column: 3, offset: 6 },
      end: { line: 3, column: 2, offset: 10 },
    };
    const source = "line1\nline2\nend";

    const result = convertLocation(mockLoc, source);
    expect(result).toEqual({
      offset: 8, // 6 chars in line1 + 1 newline + 1 for column 3 position
      length: 5, // remaining chars in line2 + newline + 2 chars in line3
    });
  });
});
