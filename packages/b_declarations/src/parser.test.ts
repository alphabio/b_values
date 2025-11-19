// b_path:: packages/b_declarations/src/parser.test.ts
import { describe, expect, it, beforeEach } from "vitest";
import { parseDeclaration } from "./parser";
import { propertyRegistry, defineProperty } from "./core";
import { parseOk, parseErr, createError, type ParseResult } from "@b/types";
import * as csstree from "@eslint/css-tree";

describe("parseDeclaration", () => {
  beforeEach(() => {
    propertyRegistry.clear();
  });

  describe("string input", () => {
    it("should parse declaration string with semicolon", () => {
      defineProperty({
        name: "color",
        syntax: "<color>",
        multiValue: false,
        parser: (node: csstree.Value): ParseResult<string> => {
          // Simple test parser: just convert back to string
          const value = csstree.generate(node).trim();
          return parseOk(value);
        },
        inherited: true,
        initial: "black",
      });

      const result = parseDeclaration("color: red;");

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.property).toBe("color");
      expect(result.value.ir).toBe("red");
    });

    it("should parse declaration string without semicolon", () => {
      defineProperty({
        name: "color",
        syntax: "<color>",
        multiValue: false,
        parser: (node: csstree.Value): ParseResult<string> => {
          const value = csstree.generate(node).trim();
          return parseOk(value);
        },
        inherited: true,
        initial: "black",
      });

      const result = parseDeclaration("color: red");

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.property).toBe("color");
      expect(result.value.ir).toBe("red");
    });

    it("should handle whitespace in string input", () => {
      defineProperty({
        name: "background-image",
        syntax: "<image>",
        multiValue: false,
        parser: (node: csstree.Value): ParseResult<string> => {
          const value = csstree.generate(node).trim();
          return parseOk(value);
        },
        inherited: false,
        initial: "none",
      });

      const result = parseDeclaration(`
background-image: url(image.png);
`);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.property).toBe("background-image");
      expect(result.value.ir).toBe("url(image.png)");
    });

    it("should fail for string without colon", () => {
      const result = parseDeclaration("invalid declaration");

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.issues[0]?.message).toContain("Colon is expected");
    });

    it("should fail for string with empty property", () => {
      const result = parseDeclaration(": red");

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.issues[0]?.message).toContain("Identifier is expected");
    });

    it("should fail for string with empty value", () => {
      const result = parseDeclaration("color:");

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.issues[0]?.message).toContain("Empty value");
    });

    it("should fail for malformed !important", () => {
      const result = parseDeclaration("background-color: red !xxx");

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.issues[0]?.code).toBe("invalid-syntax");
      expect(result.issues[0]?.message).toContain('Invalid !important syntax: got "!xxx"');
    });

    it("should fail for bare exclamation mark", () => {
      const result = parseDeclaration("background-color: red !");

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.issues[0]?.code).toBe("invalid-syntax");
      expect(result.issues[0]?.message).toContain("Identifier is expected");
    });
  });

  describe("object input", () => {
    it("should parse object input", () => {
      defineProperty({
        name: "color",
        syntax: "<color>",
        multiValue: false,
        parser: (node: csstree.Value): ParseResult<string> => {
          const value = csstree.generate(node).trim();
          return parseOk(value);
        },
        inherited: true,
        initial: "black",
      });

      const result = parseDeclaration({
        property: "color",
        value: "red",
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.property).toBe("color");
      expect(result.value.ir).toBe("red");
    });
  });

  describe("error handling", () => {
    it("should fail for unknown property", () => {
      const result = parseDeclaration("unknown-property: value");

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.issues[0]?.message).toContain("Unknown CSS property");
    });

    it("should fail when property parser fails", () => {
      defineProperty({
        name: "test-prop",
        syntax: "<test>",
        multiValue: false,
        parser: (): ParseResult<never> => parseErr("InvalidValue", createError("invalid-value", "Parser error")),
        inherited: false,
        initial: "none",
      });

      const result = parseDeclaration("test-prop: invalid");

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.issues[0]?.message).toBe("Parser error");
    });
  });

  describe("issue enrichment - property context", () => {
    it("should add property to issues on parse failure", () => {
      defineProperty({
        name: "test-prop",
        syntax: "<test>",
        multiValue: false,
        parser: (): ParseResult<never> => parseErr("InvalidValue", createError("invalid-value", "Test error")),
        inherited: false,
        initial: "none",
      });

      const result = parseDeclaration("test-prop: invalid");

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.issues[0]?.property).toBe("test-prop");
    });

    it("should add property to issues from string input", () => {
      defineProperty({
        name: "color",
        syntax: "<color>",
        multiValue: false,
        parser: (): ParseResult<never> => parseErr("InvalidValue", createError("invalid-value", "Bad color")),
        inherited: true,
        initial: "black",
      });

      const result = parseDeclaration("color: notacolor");

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.issues[0]).toMatchObject({
        code: "invalid-value",
        message: "Bad color",
        property: "color",
      });
    });

    it("should add property to issues from object input", () => {
      defineProperty({
        name: "background-image",
        syntax: "<image>",
        multiValue: false,
        parser: (): ParseResult<never> => parseErr("InvalidValue", createError("invalid-value", "Bad image")),
        inherited: false,
        initial: "none",
      });

      const result = parseDeclaration({
        property: "background-image",
        value: "invalid",
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.issues[0]).toMatchObject({
        code: "invalid-value",
        message: "Bad image",
        property: "background-image",
      });
    });
  });

  describe("issue enrichment - success with warnings", () => {
    it("should enrich warnings on successful parse", () => {
      defineProperty({
        name: "color",
        syntax: "<color>",
        multiValue: false,
        parser: (node: csstree.Value): ParseResult<string> => {
          const value = csstree.generate(node).trim();
          // Success but with warning
          return {
            ok: true,
            value,
            issues: [
              {
                code: "legacy-syntax",
                severity: "warning",
                message: "Consider using modern syntax",
              },
            ],
          };
        },
        generator: (ir: string) => ({ ok: true, value: ir, issues: [] }), // No-op generator
        inherited: true,
        initial: "black",
      });

      const result = parseDeclaration("color: red");

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.ir).toBe("red");

      // Should have at least the warning from parser
      expect(result.issues.length).toBeGreaterThan(0);

      // Find our warning (might have generator warnings too)
      const warning = result.issues.find((i) => i.message === "Consider using modern syntax");
      expect(warning).toBeDefined();

      // Warning should be enriched
      expect(warning).toMatchObject({
        severity: "warning",
        property: "color",
      });
    });
  });

  describe("issue enrichment - partial success (ok: false with value)", () => {
    it("should enrich issues on partial success", () => {
      defineProperty({
        name: "test-multi",
        syntax: "<test>+",
        multiValue: true,
        parser: (value: string): ParseResult<string[]> => {
          const segments = value.split(",").map((s) => s.trim());
          const valid = segments.filter((s) => s !== "invalid");

          if (valid.length === 0) {
            return parseErr("InvalidValue", createError("invalid-value", "All segments invalid"));
          }

          // Partial success: ok: false, but has value
          return {
            ok: false,
            value: valid,
            issues: [createError("invalid-value", `Skipped ${segments.length - valid.length} invalid segments`)],
          };
        },
        inherited: false,
        initial: "none",
      });

      const result = parseDeclaration("test-multi: valid1, invalid, valid2");

      // Partial success per documented semantics
      expect(result.ok).toBe(false);
      expect(result.value).toBeDefined();

      // Issues should be enriched even on partial success
      expect(result.issues[0]).toMatchObject({
        code: "invalid-value",
        property: "test-multi",
      });
    });
  });
});
