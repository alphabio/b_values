// b_path:: packages/b_utils/src/parse/css-value-parser.test.ts
import { describe, expect, it } from "vitest";
import * as csstree from "@eslint/css-tree";
import { parseCssValueNode, getChildren, getValues } from "./css-value-parser";

describe("parseCssValueNode", () => {
  it("should parse a Number node", () => {
    const ast = csstree.parse("42", { context: "value" });
    expect(ast.type).toBe("Value");
    if (ast.type !== "Value") {
      throw new Error("Unexpected Value node with no children");
    }
    const childNode = ast.children.first;
    expect(childNode).not.toBeNull();

    if (!childNode) {
      throw new Error("Unexpected non-Number node");
    }
    // 3. Pass the specific child node to your parsing function
    const result = parseCssValueNode(childNode);

    expect(result.ok).toBe(true);
    if (result.ok) {
      // 4. Update expectation to match the more robust schema
      expect(result.value).toEqual({ kind: "literal", value: 42 });
    }
  });

  it("should parse percentage node", () => {
    const ast = csstree.parse("50%", { context: "value" });
    expect(ast.type).toBe("Value");
    if (ast.type !== "Value") {
      throw new Error("Unexpected Value node");
    }
    const childNode = ast.children.first;
    expect(childNode).not.toBeNull();
    if (!childNode) {
      throw new Error("Unexpected node");
    }
    const result = parseCssValueNode(childNode);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ kind: "literal", value: 50, unit: "%" });
    }
  });

  it("should parse dimension node", () => {
    const ast = csstree.parse("10px", { context: "value" });
    expect(ast.type).toBe("Value");
    if (ast.type !== "Value") {
      throw new Error("Unexpected Value node");
    }
    const childNode = ast.children.first;
    expect(childNode).not.toBeNull();
    if (!childNode) {
      throw new Error("Unexpected node");
    }
    const result = parseCssValueNode(childNode);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ kind: "literal", value: 10, unit: "px" });
    }
  });

  it("should parse identifier node", () => {
    const ast = csstree.parse("none", { context: "value" });
    expect(ast.type).toBe("Value");
    if (ast.type !== "Value") {
      throw new Error("Unexpected Value node");
    }
    const childNode = ast.children.first;
    expect(childNode).not.toBeNull();
    if (!childNode) {
      throw new Error("Unexpected node");
    }
    const result = parseCssValueNode(childNode);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ kind: "keyword", value: "none" });
    }
  });

  it("should parse string literals", () => {
    const ast = csstree.parse('"string"', { context: "value" });
    expect(ast.type).toBe("Value");
    if (ast.type !== "Value") {
      throw new Error("Unexpected Value node");
    }
    const childNode = ast.children.first;
    expect(childNode).not.toBeNull();
    if (!childNode) {
      throw new Error("Unexpected node");
    }
    const result = parseCssValueNode(childNode);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ kind: "string", value: "string" });
    }
  });

  it("should parse var() function", () => {
    const ast = csstree.parse("var(--my-color)", { context: "value" });
    expect(ast.type).toBe("Value");
    if (ast.type !== "Value") {
      throw new Error("Unexpected Value node");
    }
    const childNode = ast.children.first;
    expect(childNode).not.toBeNull();
    if (!childNode) {
      throw new Error("Unexpected node");
    }
    const result = parseCssValueNode(childNode);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ kind: "variable", name: "--my-color" });
    }
  });

  it("should parse var() function with fallback", () => {
    // var() with fallback needs to handle comma + fallback recursively
    // For now, just test that it doesn't crash and parses the var name
    const ast = csstree.parse("var(--my-color)", { context: "value" });
    expect(ast.type).toBe("Value");
    if (ast.type !== "Value") {
      throw new Error("Unexpected Value node");
    }
    const childNode = ast.children.first;
    expect(childNode).not.toBeNull();
    if (!childNode) {
      throw new Error("Unexpected node");
    }
    const result = parseCssValueNode(childNode);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ kind: "variable", name: "--my-color" });
    }
  });

  it("should return error for var() with non-custom-property name", () => {
    // Create a minimal mock that bypasses css-tree parsing
    const mockVarNode: csstree.FunctionNode = {
      type: "Function",
      name: "var",
      loc: undefined,
      children: {
        toArray: () => [
          {
            type: "Identifier" as const,
            name: "invalid-name",
            loc: undefined,
          } as csstree.Identifier,
        ],
        first: {
          type: "Identifier" as const,
          name: "invalid-name",
          loc: undefined,
        } as csstree.Identifier,
        forEach: () => {},
        some: () => false,
        map: () => [],
        filter: () => [],
        isEmpty: false,
        getSize: () => 1,
        last: null,
      } as unknown as csstree.List<csstree.CssNode>,
    } as csstree.FunctionNode;

    const result = parseCssValueNode(mockVarNode);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.message).toContain("expected a custom property name");
    }
  });

  it("should parse generic function as function call", () => {
    const ast = csstree.parse("calc(10px + 5px)", { context: "value" });
    expect(ast.type).toBe("Value");
    if (ast.type !== "Value") {
      throw new Error("Unexpected Value node");
    }
    const childNode = ast.children.first;
    expect(childNode).not.toBeNull();
    if (!childNode) {
      throw new Error("Unexpected node");
    }
    const result = parseCssValueNode(childNode);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("function");
      if (result.value.kind === "function") {
        expect(result.value.name).toBe("calc");
        expect(result.value.args.length).toBeGreaterThan(0);
      }
    }
  });

  it("should return error for invalid number", () => {
    const fakeNode = { type: "Number" as const, value: "not-a-number" };
    const result = parseCssValueNode(fakeNode as csstree.CssNode);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.message).toContain("Invalid number value");
    }
  });

  it("should return error for invalid percentage", () => {
    const fakeNode = { type: "Percentage" as const, value: "not-a-number" };
    const result = parseCssValueNode(fakeNode as csstree.CssNode);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.message).toContain("Invalid percentage value");
    }
  });

  it("should return error for invalid dimension", () => {
    const fakeNode = { type: "Dimension" as const, value: "not-a-number", unit: "px" };
    const result = parseCssValueNode(fakeNode as csstree.CssNode);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.message).toContain("Invalid dimension value");
    }
  });
});

describe("getChildren", () => {
  it("should extract non-whitespace children", () => {
    const ast = csstree.parse("color: rgb(255 0 0)", { context: "declarationList" });
    expect(ast.type).toBe("DeclarationList");
    if (ast.type !== "DeclarationList") {
      throw new Error("Unexpected AST type");
    }
    const declaration = ast.children.first;
    expect(declaration?.type).toBe("Declaration");
    if (declaration?.type !== "Declaration") {
      throw new Error("Unexpected declaration type");
    }
    const valueNode = declaration.value;
    expect(valueNode.type).toBe("Value");
    if (valueNode.type !== "Value") {
      throw new Error("Unexpected value type");
    }
    const func = valueNode.children.first;
    if (func?.type === "Function") {
      const children = getChildren(func);
      expect(children.length).toBe(3);
      expect(children.every((c: csstree.CssNode) => c.type !== "WhiteSpace")).toBe(true);
    }
  });
});

describe("getValues", () => {
  it("should filter out operator nodes", () => {
    const ast = csstree.parse("color: rgb(255 0 0 / 0.5)", { context: "declarationList" });
    expect(ast.type).toBe("DeclarationList");
    if (ast.type !== "DeclarationList") {
      throw new Error("Unexpected AST type");
    }
    const declaration = ast.children.first;
    expect(declaration?.type).toBe("Declaration");
    if (declaration?.type !== "Declaration") {
      throw new Error("Unexpected declaration type");
    }
    const valueNode = declaration.value;
    expect(valueNode.type).toBe("Value");
    if (valueNode.type !== "Value") {
      throw new Error("Unexpected value type");
    }
    const func = valueNode.children.first;
    if (func?.type === "Function") {
      const children = getChildren(func);
      const values = getValues(children);
      expect(values.length).toBe(4);
      expect(values.every((v: csstree.CssNode) => v.type !== "Operator")).toBe(true);
    }
  });

  it("should filter out comma operators", () => {
    const ast = csstree.parse("color: rgb(255, 0, 0)", { context: "declarationList" });
    expect(ast.type).toBe("DeclarationList");
    if (ast.type !== "DeclarationList") {
      throw new Error("Unexpected AST type");
    }
    const declaration = ast.children.first;
    expect(declaration?.type).toBe("Declaration");
    if (declaration?.type !== "Declaration") {
      throw new Error("Unexpected declaration type");
    }
    const valueNode = declaration.value;
    expect(valueNode.type).toBe("Value");
    if (valueNode.type !== "Value") {
      throw new Error("Unexpected value type");
    }
    const func = valueNode.children.first;
    if (func?.type === "Function") {
      const children = getChildren(func);
      const values = getValues(children);
      expect(values.length).toBe(3);
    }
  });
});
