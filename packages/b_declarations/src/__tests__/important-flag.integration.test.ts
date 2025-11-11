// b_path:: packages/b_declarations/src/__tests__/important-flag.integration.test.ts
/**
 * Integration tests for !important flag handling across the declarations API.
 *
 * This demonstrates the proper architecture:
 * 1. Property parsers (parseBackgroundSize) - value-level, no !important
 * 2. Declaration parsers (parseDeclaration) - declaration-level, handles !important
 * 3. Declaration generators (generateDeclaration) - declaration-level, handles !important
 */

import { describe, it, expect } from "vitest";
import { parseDeclaration } from "../parser";
import { generateDeclaration } from "../generator";
import { parseBackgroundSize } from "../properties";
import type { BackgroundSizeIR } from "@b/declarations";

describe("!important flag integration", () => {
  describe("parseDeclaration - high-level API", () => {
    it("should parse declaration with !important", () => {
      const result = parseDeclaration("background-size: auto 100px, cover !important");

      expect(result.ok).toBe(true);
      expect(result.value?.property).toBe("background-size");
      expect(result.value?.important).toBe(true);
      expect(result.value?.ir).toMatchObject({
        kind: "list",
        values: [
          {
            kind: "explicit",
            width: { kind: "keyword", value: "auto" },
            height: { kind: "literal", value: 100, unit: "px" },
          },
          { kind: "keyword", value: "cover" },
        ],
      });
    });

    it("should parse declaration without !important", () => {
      const result = parseDeclaration("background-size: auto 100px, cover");

      expect(result.ok).toBe(true);
      expect(result.value?.important).toBeUndefined();
    });

    it("should handle !important with object input", () => {
      const result = parseDeclaration({
        property: "background-size",
        value: "auto 100px, cover",
        important: true,
      });

      expect(result.ok).toBe(true);
      expect(result.value?.important).toBe(true);
    });
  });

  describe("generateDeclaration - high-level API", () => {
    it("should generate declaration with !important flag", () => {
      const result = generateDeclaration({
        property: "background-size",
        ir: {
          kind: "list",
          values: [
            {
              kind: "explicit",
              width: { kind: "keyword", value: "auto" },
              height: { kind: "literal", value: 100, unit: "px" },
            },
            { kind: "keyword", value: "cover" },
          ],
        },
        important: true,
      });

      expect(result.ok).toBe(true);
      expect(result.value).toBe("background-size: auto 100px, cover !important");
    });

    it("should generate declaration without !important when flag is false", () => {
      const result = generateDeclaration({
        property: "background-size",
        ir: {
          kind: "list",
          values: [{ kind: "keyword", value: "cover" }],
        },
        important: false,
      });

      expect(result.ok).toBe(true);
      expect(result.value).toBe("background-size: cover");
    });

    it("should generate declaration without !important when flag is undefined", () => {
      const result = generateDeclaration({
        property: "background-size",
        ir: {
          kind: "list",
          values: [{ kind: "keyword", value: "contain" }],
        },
      });

      expect(result.ok).toBe(true);
      expect(result.value).toBe("background-size: contain");
    });
  });

  describe("parseBackgroundSize - low-level API", () => {
    it("should fail with helpful error when !important is in value", () => {
      const result = parseBackgroundSize("auto 100px, cover !important");

      expect(result.ok).toBe(false);
      expect(result.issues[0]?.message).toContain("!important");
      expect(result.issues[0]?.message).toContain("parseDeclaration()");
      expect(result.issues[0]?.message).toContain("not property parsers directly");
    });

    it("should parse values without !important correctly", () => {
      const result = parseBackgroundSize("auto 100px, cover");

      expect(result.ok).toBe(true);
      expect(result.value).toMatchObject({
        kind: "list",
        values: [
          {
            kind: "explicit",
            width: { kind: "keyword", value: "auto" },
            height: { kind: "literal", value: 100, unit: "px" },
          },
          { kind: "keyword", value: "cover" },
        ],
      });
    });
  });

  describe("round-trip: parse → generate with !important", () => {
    it("should preserve !important flag through round-trip", () => {
      // Parse
      const parsed = parseDeclaration("background-size: 100px 200px !important");
      expect(parsed.ok).toBe(true);
      expect(parsed.value?.important).toBe(true);
      // Generate
      if (parsed.ok && parsed.value) {
        const generated = generateDeclaration<"background-size">({
          property: "background-size",
          ir: parsed.value.ir as BackgroundSizeIR,
          important: parsed.value.important,
        });

        expect(generated.ok).toBe(true);
        expect(generated.value).toBe("background-size: 100px 200px !important");
      }
    });

    it("should round-trip without !important", () => {
      // Parse
      const parsed = parseDeclaration("background-size: 100px 200px");
      expect(parsed.ok).toBe(true);
      expect(parsed.value?.important).toBeUndefined();
      // Generate
      if (parsed.ok && parsed.value) {
        const generated = generateDeclaration({
          property: parsed.value.property as "background-size",
          ir: parsed.value.ir as BackgroundSizeIR,
        });

        expect(generated.ok).toBe(true);
        expect(generated.value).toBe("background-size: 100px 200px");
        expect(generated.value).not.toContain("!important");
      }
    });
  });
});
