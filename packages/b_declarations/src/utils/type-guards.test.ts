// b_path:: packages/b_declarations/src/utils/type-guards.test.ts

import { describe, it, expect } from "vitest";
import type { CssValue } from "@b/types";
import { isCssValue, isUniversalFunction, isConcreteValue } from "./type-guards";
import * as csstree from "@eslint/css-tree";

describe("isCssValue", () => {
  it("should identify CssValue objects", () => {
    expect(isCssValue({ kind: "variable", name: "--x" })).toBe(true);
    expect(isCssValue({ kind: "calc", value: {} })).toBe(true);
    expect(isCssValue({ kind: "literal", value: 10 })).toBe(true);
    expect(isCssValue({ kind: "keyword", value: "red" })).toBe(true);
    expect(isCssValue({ kind: "list", separator: ",", values: [] })).toBe(true);
    expect(isCssValue({ kind: "calc-operation", operator: "+", left: {}, right: {} })).toBe(true);
    expect(isCssValue({ kind: "min", values: [] })).toBe(true);
    expect(isCssValue({ kind: "max", values: [] })).toBe(true);
    expect(isCssValue({ kind: "clamp", min: {}, preferred: {}, max: {} })).toBe(true);
    expect(isCssValue({ kind: "url", url: "test.jpg" })).toBe(true);
    expect(isCssValue({ kind: "attr", name: "data-x" })).toBe(true);
    expect(isCssValue({ kind: "function", name: "test", args: [] })).toBe(true);
    expect(isCssValue({ kind: "string", value: "test" })).toBe(true);
    expect(isCssValue({ kind: "hex-color", value: "#fff" })).toBe(true);
  });

  it("should reject property IR objects with 'kind' field", () => {
    // RepeatStyle IR (has "kind" but different from CssValue)
    expect(isCssValue({ kind: "explicit", horizontal: "repeat", vertical: "space" })).toBe(false);

    // BackgroundSize IR
    expect(isCssValue({ kind: "auto" })).toBe(false);

    // Custom property IR structures
    expect(isCssValue({ kind: "shorthand", value: "repeat-x" })).toBe(false);
  });

  it("should reject non-objects", () => {
    expect(isCssValue(null)).toBe(false);
    expect(isCssValue(undefined)).toBe(false);
    expect(isCssValue("string")).toBe(false);
    expect(isCssValue(42)).toBe(false);
    expect(isCssValue(true)).toBe(false);
  });

  it("should reject objects without 'kind' field", () => {
    expect(isCssValue({ value: 10 })).toBe(false);
    expect(isCssValue({})).toBe(false);
    expect(isCssValue({ name: "test" })).toBe(false);
  });

  it("should reject objects with non-CssValue kind values", () => {
    expect(isCssValue({ kind: "unknown" })).toBe(false);
    expect(isCssValue({ kind: "custom-kind" })).toBe(false);
  });
});

describe("isUniversalFunction", () => {
  it("should identify var() function", () => {
    const ast = csstree.parse("var(--x)", { context: "value" }) as csstree.Value;
    const node = ast.children.first;
    expect(node).toBeDefined();
    expect(isUniversalFunction(node!)).toBe(true);
  });

  it("should identify calc() function", () => {
    const ast = csstree.parse("calc(10px + 5%)", { context: "value" }) as csstree.Value;
    const node = ast.children.first;
    expect(node).toBeDefined();
    expect(isUniversalFunction(node!)).toBe(true);
  });

  it("should identify min() function", () => {
    const ast = csstree.parse("min(50vw, 500px)", { context: "value" }) as csstree.Value;
    const node = ast.children.first;
    expect(node).toBeDefined();
    expect(isUniversalFunction(node!)).toBe(true);
  });

  it("should identify max() function", () => {
    const ast = csstree.parse("max(100px, 10%)", { context: "value" }) as csstree.Value;
    const node = ast.children.first;
    expect(node).toBeDefined();
    expect(isUniversalFunction(node!)).toBe(true);
  });

  it("should identify clamp() function", () => {
    const ast = csstree.parse("clamp(10px, 5vw, 50px)", { context: "value" }) as csstree.Value;
    const node = ast.children.first;
    expect(node).toBeDefined();
    expect(isUniversalFunction(node!)).toBe(true);
  });

  it("should identify attr() function", () => {
    const ast = csstree.parse("attr(data-value)", { context: "value" }) as csstree.Value;
    const node = ast.children.first;
    expect(node).toBeDefined();
    expect(isUniversalFunction(node!)).toBe(true);
  });

  it("should identify env() function", () => {
    const ast = csstree.parse("env(safe-area-inset-top)", { context: "value" }) as csstree.Value;
    const node = ast.children.first;
    expect(node).toBeDefined();
    expect(isUniversalFunction(node!)).toBe(true);
  });

  it("should reject property-specific functions", () => {
    const rgbAst = csstree.parse("rgb(255, 0, 0)", { context: "value" }) as csstree.Value;
    const rgbNode = rgbAst.children.first;
    expect(isUniversalFunction(rgbNode!)).toBe(false);

    const gradientAst = csstree.parse("linear-gradient(red, blue)", { context: "value" }) as csstree.Value;
    const gradientNode = gradientAst.children.first;
    expect(isUniversalFunction(gradientNode!)).toBe(false);

    const urlAst = csstree.parse("url(test.jpg)", { context: "value" }) as csstree.Value;
    const urlNode = urlAst.children.first;
    // url() is NOT a function node in csstree (it's a Url type), but if it were:
    // We only check Function nodes anyway, so this would fail the type check
    expect(urlNode?.type).toBe("Url"); // Verify assumption
  });

  it("should reject non-function nodes", () => {
    const identAst = csstree.parse("red", { context: "value" }) as csstree.Value;
    const identNode = identAst.children.first;
    expect(isUniversalFunction(identNode!)).toBe(false);

    const numberAst = csstree.parse("10", { context: "value" }) as csstree.Value;
    const numberNode = numberAst.children.first;
    expect(isUniversalFunction(numberNode!)).toBe(false);

    const dimensionAst = csstree.parse("10px", { context: "value" }) as csstree.Value;
    const dimensionNode = dimensionAst.children.first;
    expect(isUniversalFunction(dimensionNode!)).toBe(false);
  });

  it("should be case-insensitive", () => {
    const varAst = csstree.parse("VAR(--x)", { context: "value" }) as csstree.Value;
    const varNode = varAst.children.first;
    expect(isUniversalFunction(varNode!)).toBe(true);

    const calcAst = csstree.parse("Calc(10px)", { context: "value" }) as csstree.Value;
    const calcNode = calcAst.children.first;
    expect(isUniversalFunction(calcNode!)).toBe(true);

    const minAst = csstree.parse("MIN(5px, 10px)", { context: "value" }) as csstree.Value;
    const minNode = minAst.children.first;
    expect(isUniversalFunction(minNode!)).toBe(true);
  });
});

describe("isConcreteValue", () => {
  it("should identify concrete string values", () => {
    expect(isConcreteValue("border-box")).toBe(true);
    expect(isConcreteValue("padding-box")).toBe(true);
  });

  it("should identify concrete object values", () => {
    expect(isConcreteValue({ horizontal: "repeat", vertical: "space" })).toBe(true);
    expect(isConcreteValue({ kind: "explicit", horizontal: "repeat", vertical: "space" })).toBe(true);
  });

  it("should reject CssValues", () => {
    expect(isConcreteValue({ kind: "variable", name: "--x" })).toBe(false);
    expect(isConcreteValue({ kind: "calc", value: {} })).toBe(false);
    expect(isConcreteValue({ kind: "literal", value: 10 })).toBe(false);
  });

  it("should handle mixed union types correctly", () => {
    const concreteValue: string | CssValue = "border-box";
    expect(isConcreteValue(concreteValue)).toBe(true);

    const cssValue: string | CssValue = { kind: "variable", name: "--x" };
    expect(isConcreteValue(cssValue)).toBe(false);
  });
});
