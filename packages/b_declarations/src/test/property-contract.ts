// b_path:: packages/b_declarations/src/test/property-contract.ts

import { describe, it, expect } from "vitest";
import { parseDeclaration } from "../parser";
import { generateDeclaration } from "../generator";
import type { ParseResult, GenerateResult } from "@b/types";

/**
 * Normalize CSS string for comparison (whitespace, etc.)
 */
function norm(css: string): string {
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
  schema?: { parse: (input: unknown) => TIR };
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
 *   schema: backgroundSizeIRSchema,
 *   parse: [
 *     { css: "background-size: auto", expectOk: true, irContains: { kind: "list" } },
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

  if (opts.parse?.length) {
    describe(`${property} :: parseDeclaration`, () => {
      for (const c of opts.parse!) {
        it(c.css, () => {
          const res = parseDeclaration(c.css) as ParseResult<{ property: string; ir: TIR }>;

          if (c.expectOk) {
            expect(res.ok).toBe(true);
            if (!res.ok) return;

            // Verify property name is correct
            expect(res.value.property).toBe(property);

            // Optional: validate IR against schema (throws if invalid)
            if (opts.schema) {
              opts.schema.parse(res.value.ir);
            }

            // Optional: verify IR contains expected shape
            if (c.irContains) {
              expect(res.value.ir).toMatchObject(c.irContains);
            }
          } else {
            expect(res.ok).toBe(false);
          }
        });
      }
    });
  }

  if (opts.generate?.length) {
    describe(`${property} :: generateDeclaration`, () => {
      for (const c of opts.generate!) {
        const label = JSON.stringify(c.ir).substring(0, 60);
        it(label, () => {
          const res = generateDeclaration({
            property: c.property as never,
            ir: c.ir as never,
          }) as GenerateResult;

          if (c.expectOk) {
            expect(res.ok).toBe(true);
            if (!res.ok) return;

            if (c.expectValue) {
              expect(norm(res.value)).toBe(norm(c.expectValue));
            }
          } else {
            expect(res.ok).toBe(false);
          }
        });
      }
    });
  }

  if (opts.roundtrip?.length) {
    describe(`${property} :: roundtrip`, () => {
      for (const c of opts.roundtrip!) {
        it(c.css, () => {
          // Parse
          const parsed = parseDeclaration(c.css) as ParseResult<{ property: string; ir: TIR }>;
          expect(parsed.ok).toBe(true);
          if (!parsed.ok) return;
          expect(parsed.value.property).toBe(property);

          // Generate
          const gen = generateDeclaration({
            property: property as never,
            ir: parsed.value.ir as never,
          }) as GenerateResult;

          expect(gen.ok).toBe(true);
          if (!gen.ok) return;

          // Compare
          const expected = c.expectCss ?? c.css;
          expect(norm(gen.value)).toBe(norm(expected));
        });
      }
    });
  }
}
