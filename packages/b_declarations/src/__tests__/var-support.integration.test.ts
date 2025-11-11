// b_path:: packages/b_declarations/src/__tests__/var-support.integration.test.ts
/**
 * Integration tests demonstrating var() and CSS function support
 * across background-* properties.
 */

import { describe, it, expect } from "vitest";
import { parseDeclaration, generateDeclaration } from "..";
import type { BackgroundSizeIR, BackgroundClipIR, BackgroundRepeatIR } from "@b/declarations";

describe("var() and CSS function support", () => {
  describe("background-size", () => {
    it("should parse and generate var() with fallback", () => {
      const parsed = parseDeclaration("background-size: var(--size, 100px)");
      expect(parsed.ok).toBe(true);

      if (parsed.ok) {
        const generated = generateDeclaration({
          property: "background-size",
          ir: parsed.value.ir as BackgroundSizeIR,
        });
        expect(generated.ok).toBe(true);
        expect(generated.value).toBe("background-size: var(--size, 100px)");
      }
    });

    it("should parse calc() with var()", () => {
      const parsed = parseDeclaration("background-size: calc(var(--base) * 2)");
      expect(parsed.ok).toBe(true);
      expect(parsed.value?.ir).toMatchObject({
        kind: "list",
        values: [
          {
            kind: "calc",
            value: {
              kind: "calc-operation",
              operator: "*",
              left: { kind: "variable", name: "--base" },
              right: { kind: "literal", value: 2 },
            },
          },
        ],
      });
    });
  });

  describe("background-clip", () => {
    it("should parse and generate var()", () => {
      const parsed = parseDeclaration("background-clip: var(--clip)");
      expect(parsed.ok).toBe(true);

      if (parsed.ok) {
        const generated = generateDeclaration({
          property: "background-clip",
          ir: parsed.value.ir as BackgroundClipIR,
        });
        expect(generated.ok).toBe(true);
        expect(generated.value).toBe("background-clip: var(--clip)");
      }
    });

    it("should parse var() with fallback", () => {
      const parsed = parseDeclaration("background-clip: var(--clip, border-box)");
      expect(parsed.ok).toBe(true);
      expect(parsed.value?.ir).toMatchObject({
        kind: "list",
        values: [
          {
            kind: "variable",
            name: "--clip",
            fallback: { kind: "keyword", value: "border-box" },
          },
        ],
      });
    });

    it("should still parse regular keywords", () => {
      const parsed = parseDeclaration("background-clip: padding-box, content-box");
      expect(parsed.ok).toBe(true);
      expect(parsed.value?.ir).toMatchObject({
        kind: "list",
        values: ["padding-box", "content-box"],
      });
    });
  });

  describe("background-repeat", () => {
    it("should parse and generate var()", () => {
      const parsed = parseDeclaration("background-repeat: var(--repeat)");
      expect(parsed.ok).toBe(true);

      if (parsed.ok) {
        const generated = generateDeclaration({
          property: "background-repeat",
          ir: parsed.value.ir as BackgroundRepeatIR,
        });
        expect(generated.ok).toBe(true);
        expect(generated.value).toBe("background-repeat: var(--repeat)");
      }
    });

    it("should parse nested var() with fallbacks", () => {
      const parsed = parseDeclaration("background-repeat: var(--primary, var(--fallback, repeat))");
      expect(parsed.ok).toBe(true);
      expect(parsed.value?.ir).toMatchObject({
        kind: "list",
        values: [
          {
            kind: "variable",
            name: "--primary",
            fallback: {
              kind: "variable",
              name: "--fallback",
              fallback: { kind: "keyword", value: "repeat" },
            },
          },
        ],
      });
    });

    it("should still parse structured repeat-style", () => {
      const parsed = parseDeclaration("background-repeat: repeat-x, no-repeat space");
      expect(parsed.ok).toBe(true);
      expect(parsed.value?.ir).toMatchObject({
        kind: "list",
        values: [
          { kind: "shorthand", value: "repeat-x" },
          { kind: "explicit", horizontal: "no-repeat", vertical: "space" },
        ],
      });
    });
  });

  describe("mixed usage", () => {
    it("should handle mix of var() and regular values", () => {
      const parsed = parseDeclaration("background-clip: var(--clip1), border-box, var(--clip2)");
      expect(parsed.ok).toBe(true);
      expect(parsed.value?.ir).toMatchObject({
        kind: "list",
        values: [{ kind: "variable", name: "--clip1" }, "border-box", { kind: "variable", name: "--clip2" }],
      });
    });
  });
});
