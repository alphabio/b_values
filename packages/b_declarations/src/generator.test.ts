// b_path:: packages/b_declarations/src/generator.test.ts
import { describe, expect, it, beforeEach } from "vitest";
import { generateDeclaration } from "./generator";
import { propertyRegistry, defineProperty } from "./core";
import { generateOk, generateErr, createError, parseOk, type GenerateResult } from "@b/types";
import type * as csstree from "@eslint/css-tree";

// Helper mock parser that accepts AST node (for testing generators)
function mockParser<T>(fn: (value: string) => T) {
  return (node: csstree.Value) => {
    // Simple mock: extract string from AST
    const value = String(node);
    return parseOk(fn(value));
  };
}

describe("generateDeclaration", () => {
  beforeEach(() => {
    propertyRegistry.clear();
  });

  describe("successful generation", () => {
    it("should handle complex IR values", () => {
      type ComplexIR = { kind: "gradient"; value: string };

      defineProperty({
        name: "background-image",
        syntax: "<background-image>",
        parser: mockParser((value: string) => ({ kind: "gradient" as const, value })),
        generator: (ir: ComplexIR): GenerateResult => generateOk(`${ir.kind}(${ir.value})`),
        inherited: false,
        initial: "transparent",
      });

      const result = generateDeclaration({
        property: "background-image",
        ir: { kind: "list", values: [] },
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toContain("background-image:");
    });
  });

  describe("error handling", () => {
    it("should fail for unknown property", () => {
      const result = generateDeclaration({
        // @ts-expect-error Testing unknown property
        property: "unknown-property",
        // @ts-expect-error Testing unknown property
        ir: "value",
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.issues[0]?.code).toBe("invalid-ir");
      expect(result.issues[0]?.message).toContain("Unknown CSS property");
      expect(result.issues[0]?.suggestion).toContain("Check property name spelling");
      expect(result.property).toBe("unknown-property");
    });

    it("should fail when property has no generator", () => {
      defineProperty({
        name: "color",
        syntax: "<color>",
        parser: mockParser((value: string) => value.trim()),
        // No generator provided
        inherited: true,
        initial: "black",
      });

      const result = generateDeclaration({
        // @ts-expect-error Testing unknown property
        property: "coslor",
        // @ts-expect-error Testing unknown property
        ir: "red",
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.issues[0]?.code).toBe("invalid-ir");
      expect(result.issues[0]?.message).toContain("Unknown CSS property: coslor");
      expect(result.issues[0]?.suggestion).toContain("Check property name spelling or ensure property is registered");
      expect(result.property).toBe("coslor");
    });

    it("should propagate generator errors", () => {
      defineProperty({
        name: "test-prop",
        syntax: "<test>",
        parser: mockParser((value: string) => value),
        generator: (): GenerateResult =>
          generateErr(createError("invalid-ir", "Generator failed", { suggestion: "Fix the IR" }), "test-prop"),
        inherited: false,
        initial: "none",
      });

      const result = generateDeclaration({
        // @ts-expect-error Testing unknown property
        property: "test-prop",
        // @ts-expect-error Testing unknown property
        ir: "invalid",
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.issues[0]?.code).toBe("invalid-ir");
      expect(result.issues[0]?.message).toBe("Generator failed");
      expect(result.issues[0]?.suggestion).toBe("Fix the IR");
    });

    it("should handle generator errors with warnings", () => {
      defineProperty({
        name: "test-prop",
        syntax: "<test>",
        parser: mockParser((value: string) => value),
        generator: (): GenerateResult => generateErr(createError("invalid-ir", "Multiple issues"), "test-prop"),
        inherited: false,
        initial: "none",
      });

      const result = generateDeclaration({
        // @ts-expect-error Testing unknown property
        property: "test-prop",
        // @ts-expect-error Testing unknown property
        ir: "invalid",
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.issues.length).toBeGreaterThanOrEqual(1);
      expect(result.issues[0]?.message).toContain("Multiple issues");
    });
  });

  describe("edge cases", () => {
    it("should handle empty string values", () => {
      defineProperty({
        name: "content",
        syntax: "<string>",
        parser: mockParser((value: string) => value),
        generator: (ir: string): GenerateResult => generateOk(`"${ir}"`),
        inherited: false,
        initial: "normal",
      });

      const result = generateDeclaration({
        // @ts-expect-error Testing unknown property
        property: "content",
        // @ts-expect-error Testing unknown property
        ir: "",
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe('content: ""');
    });

    it("should handle special characters in values", () => {
      defineProperty({
        name: "content",
        syntax: "<string>",
        parser: mockParser((value: string) => value),
        generator: (ir: string): GenerateResult => generateOk(ir),
        inherited: false,
        initial: "normal",
      });

      const result = generateDeclaration({
        // @ts-expect-error Testing unknown property
        property: "content",
        // @ts-expect-error Testing unknown property
        ir: '"hello\\nworld"',
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe('content: "hello\\nworld"');
    });
  });
});
