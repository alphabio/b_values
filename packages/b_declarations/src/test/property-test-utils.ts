// b_path:: packages/b_declarations/src/test/property-test-utils.ts

import { describe, it, expect } from "vitest";
import { parseDeclaration } from "../parser";
import { generateDeclaration } from "../generator";
import type { GenerateResult } from "@b/types";

/**
 * Normalize CSS string for comparison (whitespace, etc.)
 */
function normalizeCss(css: string): string {
  return css.trim().replace(/\s+/g, " ");
}

/**
 * Test case for parsing a declaration.
 */
export interface ParseCase<TIR = unknown> {
  /** Full CSS declaration: "property: value" */
  css: string;
  /** Expected parse outcome */
  expectOk: boolean;
  /** Optional: partial IR shape to validate against */
  irContains?: Partial<TIR>;
}

/**
 * Test case for generating a declaration.
 */
export interface GenerateCase<TIR = unknown> {
  /** Property name */
  property: string;
  /** IR to generate from */
  ir: TIR;
  /** Expected generate outcome */
  expectOk: boolean;
  /** Optional: expected CSS output (full "prop: value" or just value) */
  expectValue?: string;
}

/**
 * Test case for roundtrip (parse → generate).
 */
export interface RoundtripCase {
  /** Input CSS declaration: "property: value" */
  css: string;
  /** Optional: normalized expected output (defaults to input) */
  expectCss?: string;
}

/**
 * Options for running standardized property tests.
 */
export interface RunPropertyTestsOptions<TIR> {
  /** CSS property name */
  property: string;
  /** Optional: Zod schema or validator for IR */
  schema?: { parse: (ir: unknown) => TIR };
  /** Parse test cases */
  parse?: ParseCase<TIR>[];
  /** Generate test cases */
  generate?: GenerateCase<TIR>[];
  /** Roundtrip test cases */
  roundtrip?: RoundtripCase[];
}

/**
 * Standardized contract tests for a CSS property.
 *
 * Enforces consistent behavior across:
 * - parseDeclaration
 * - generateDeclaration
 * - roundtrip consistency
 * - optional IR schema validation
 *
 * @example
 * ```typescript
 * runPropertyTests<BackgroundSizeIR>({
 *   property: "background-size",
 *   parse: [
 *     { css: "background-size: auto", expectOk: true },
 *     { css: "background-size: invalid", expectOk: false },
 *   ],
 *   roundtrip: [
 *     { css: "background-size: cover" },
 *     { css: "background-size: 100px 200px" },
 *   ],
 * });
 * ```
 */
export function runPropertyTests<TIR>(opts: RunPropertyTestsOptions<TIR>): void {
  const { property } = opts;

  if (opts.parse) {
    describe(`${property} :: parse`, () => {
      for (const testCase of opts.parse) {
        it(testCase.css, () => {
          const result = parseDeclaration(testCase.css);

          if (testCase.expectOk) {
            expect(result.ok).toBe(true);
            if (!result.ok) return;

            // Verify property name is correct
            expect(result.value.property).toBe(property);

            // Optional: validate IR against schema
            if (opts.schema) {
              opts.schema.parse(result.value.ir);
            }

            // Optional: verify IR contains expected shape
            if (testCase.irContains) {
              expect(result.value.ir).toMatchObject(testCase.irContains);
            }
          } else {
            expect(result.ok).toBe(false);
          }
        });
      }
    });
  }

  if (opts.generate) {
    describe(`${property} :: generate`, () => {
      for (const testCase of opts.generate) {
        const label = JSON.stringify(testCase.ir).substring(0, 60);
        it(label, () => {
          const result = generateDeclaration({
            property: testCase.property as never,
            ir: testCase.ir as never,
          }) as GenerateResult;

          if (testCase.expectOk) {
            expect(result.ok).toBe(true);
            if (!result.ok) return;

            if (testCase.expectValue) {
              expect(normalizeCss(result.value)).toBe(normalizeCss(testCase.expectValue));
            }
          } else {
            expect(result.ok).toBe(false);
          }
        });
      }
    });
  }

  if (opts.roundtrip) {
    describe(`${property} :: roundtrip`, () => {
      for (const testCase of opts.roundtrip) {
        it(testCase.css, () => {
          // Parse
          const parseResult = parseDeclaration(testCase.css);
          expect(parseResult.property ?? property).toBe(property);
          expect(parseResult.ok).toBe(true);
          if (!parseResult.ok) return;

          // Generate
          const generateResult = generateDeclaration({
            property: property as never,
            ir: parseResult.value.ir as never,
          });
          expect(generateResult.ok).toBe(true);
          if (!generateResult.ok) return;

          // Compare
          const expected = testCase.expectCss ?? testCase.css;
          expect(normalizeCss(generateResult.value)).toBe(normalizeCss(expected));
        });
      }
    });
  }
}
