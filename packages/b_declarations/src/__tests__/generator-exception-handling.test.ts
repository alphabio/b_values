// b_path:: packages/b_declarations/src/__tests__/generator-exception-handling.test.ts

import { describe, it, expect } from "vitest";
import { propertyRegistry, defineProperty } from "../core";
import type { PropertyDefinition } from "../types";
import { generateOk, createError } from "@b/types";

/**
 * Edge case test: Verify we catch generators that throw exceptions
 * instead of returning GenerateResult with ok: false
 *
 * Context: Generators SHOULD return { ok: false, issues: [...] } on errors,
 * not throw exceptions. This test verifies our integrity checks catch
 * when a generator violates this contract.
 */

describe("Generator Exception Handling Edge Cases", () => {
  it("should catch and report when generator throws instead of returning error result", () => {
    // Create a mock property with a generator that throws
    type ThrowingTestIR = { kind: "keyword"; value: string } | { kind: "boom" };

    const throwingGenerator = (ir: ThrowingTestIR) => {
      if (ir.kind === "boom") {
        throw new Error("Generator should return GenerateResult, not throw!");
      }
      return generateOk(ir.value);
    };

    const testProperty: PropertyDefinition<ThrowingTestIR> = {
      name: "test-throwing-generator",
      syntax: "<keyword>",
      inherited: false,
      initial: "initial",
      multiValue: false,
      rawValue: false,
      parser: () => ({ ok: true, value: { kind: "keyword", value: "test" }, issues: [] }),
      generator: throwingGenerator,
    };

    // Register the test property
    defineProperty(testProperty);

    // Now simulate the integrity test checking this property
    const violations: string[] = [];
    const propName = "test-throwing-generator";
    const def = propertyRegistry.get(propName);

    if (def?.generator) {
      // Use test IR that will trigger the exception
      const testIR: ThrowingTestIR = { kind: "boom" };

      try {
        const result = def.generator(testIR);

        if (result.ok) {
          const { value } = result;
          const hasPropertyPrefix = /^\s*[\w-]+\s*:/.test(value);

          if (hasPropertyPrefix) {
            violations.push(`${propName}: Generator returned value with property prefix`);
          }
        }
        // If result.ok is false, that's fine - test IR might be invalid
      } catch (error) {
        // Generator threw - this is what we're testing
        violations.push(
          `${propName}: Generator threw exception with test IR: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    // Verify we caught the exception
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain("Generator threw exception");
    expect(violations[0]).toContain("Generator should return GenerateResult");

    // Clean up
    propertyRegistry.get("test-throwing-generator") && propertyRegistry.clear();
  });

  it("should NOT report violations when generator returns error result (correct behavior)", () => {
    // Create a property with a generator that correctly returns error result
    type WellBehavedTestIR = { kind: "keyword"; value: string } | { kind: "invalid" };

    const wellBehavedGenerator = (ir: WellBehavedTestIR) => {
      if (ir.kind === "invalid") {
        // CORRECT: Return error result instead of throwing
        return {
          ok: false as const,
          issues: [createError("invalid-value", "Invalid IR")],
        };
      }
      return generateOk(ir.value);
    };

    const testProperty: PropertyDefinition<WellBehavedTestIR> = {
      name: "test-well-behaved-generator",
      syntax: "<keyword>",
      inherited: false,
      initial: "initial",
      multiValue: false,
      rawValue: false,
      parser: () => ({ ok: true, value: { kind: "keyword", value: "test" }, issues: [] }),
      generator: wellBehavedGenerator,
    };

    defineProperty(testProperty);

    const violations: string[] = [];
    const propName = "test-well-behaved-generator";
    const def = propertyRegistry.get(propName);

    if (def?.generator) {
      // Use test IR that will trigger error result
      const testIR: WellBehavedTestIR = { kind: "invalid" };

      try {
        const result = def.generator(testIR);

        if (result.ok) {
          const { value } = result;
          const hasPropertyPrefix = /^\s*[\w-]+\s*:/.test(value);

          if (hasPropertyPrefix) {
            violations.push(`${propName}: Generator returned value with property prefix`);
          }
        }
        // result.ok is false - that's fine, we're only checking format on success
      } catch (error) {
        violations.push(
          `${propName}: Generator threw exception: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    // Verify NO violations - returning error result is correct
    expect(violations).toHaveLength(0);

    // Clean up
    propertyRegistry.clear();
  });

  it("edge case: generator throws null/undefined", () => {
    type NullThrowingIR = { kind: "keyword"; value: string } | { kind: "null-throw" };

    const nullThrowingGenerator = (ir: NullThrowingIR) => {
      if (ir.kind === "null-throw") {
        // eslint-disable-next-line no-throw-literal
        throw null; // Unusual but possible
      }
      return generateOk(ir.value);
    };

    const testProperty: PropertyDefinition<NullThrowingIR> = {
      name: "test-null-throwing",
      syntax: "<keyword>",
      inherited: false,
      initial: "initial",
      multiValue: false,
      rawValue: false,
      parser: () => ({ ok: true, value: { kind: "keyword", value: "test" }, issues: [] }),
      generator: nullThrowingGenerator,
    };

    defineProperty(testProperty);

    const violations: string[] = [];
    const def = propertyRegistry.get("test-null-throwing");

    if (def?.generator) {
      const testIR: NullThrowingIR = { kind: "null-throw" };

      try {
        def.generator(testIR);
      } catch (error) {
        violations.push(
          `test-null-throwing: Generator threw exception: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    // Verify we caught the null throw and converted to string
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain("Generator threw exception");
    expect(violations[0]).toMatch(/null|undefined/);

    propertyRegistry.clear();
  });
});
