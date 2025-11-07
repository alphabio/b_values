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
      expect(result.value.original).toBe("red");
    });

    it("should parse declaration string without semicolon", () => {
      defineProperty({
        name: "color",
        syntax: "<color>",
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

      expect(result.issues[0]?.message).toContain("missing colon");
    });

    it("should fail for string with empty property", () => {
      const result = parseDeclaration(": red");

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.issues[0]?.message).toContain("empty property");
    });

    it("should fail for string with empty value", () => {
      const result = parseDeclaration("color:");

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.issues[0]?.message).toContain("empty value");
    });
  });

  describe("object input", () => {
    it("should parse object input", () => {
      defineProperty({
        name: "color",
        syntax: "<color>",
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
      expect(result.value.original).toBe("red");
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
        parser: (): ParseResult<never> => parseErr(createError("invalid-value", "Parser error")),
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
        parser: (): ParseResult<never> => parseErr(createError("invalid-value", "Test error")),
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
        parser: (): ParseResult<never> => parseErr(createError("invalid-value", "Bad color")),
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
        parser: (): ParseResult<never> => parseErr(createError("invalid-value", "Bad image")),
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

  describe("issue enrichment - source context", () => {
    it("should add sourceContext when issue has location (string input)", () => {
      defineProperty({
        name: "color",
        syntax: "<color>",
        parser: (node: csstree.Value): ParseResult<never> => {
          // Create error with location from AST node
          const location = node.loc
            ? {
                source: node.loc.source,
                start: node.loc.start,
                end: node.loc.end,
              }
            : undefined;

          return parseErr(createError("invalid-value", "Invalid color", { location }));
        },
        inherited: true,
        initial: "black",
      });

      const result = parseDeclaration("color: notacolor");

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.issues[0]?.sourceContext).toBeDefined();
      expect(result.issues[0]?.sourceContext).toContain("color: notacolor");
      expect(result.issues[0]?.sourceContext).toContain("^"); // Visual pointer
    });

    it("should add sourceContext when issue has location (object input)", () => {
      defineProperty({
        name: "background-image",
        syntax: "<image>",
        parser: (node: csstree.Value): ParseResult<never> => {
          const location = node.loc
            ? {
                source: node.loc.source,
                start: node.loc.start,
                end: node.loc.end,
              }
            : undefined;

          return parseErr(createError("invalid-value", "Invalid image", { location }));
        },
        inherited: false,
        initial: "none",
      });

      const result = parseDeclaration({
        property: "background-image",
        value: "notafunction()",
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;

      // Should reconstruct source as "property: value"
      expect(result.issues[0]?.sourceContext).toBeDefined();
      expect(result.issues[0]?.sourceContext).toContain("background-image: notafunction()");
      expect(result.issues[0]?.sourceContext).toContain("^");
    });

    it("should handle issues without location (multi-value parsers)", () => {
      defineProperty({
        name: "test-multi",
        syntax: "<test>+",
        multiValue: true,
        parser: (_value: string): ParseResult<string[]> => {
          // Multi-value parser returns error without location
          // (string-split approach, no AST)
          return parseErr(createError("invalid-value", "Invalid segment"));
        },
        inherited: false,
        initial: "none",
      });

      const result = parseDeclaration("test-multi: segment1, invalid, segment3");

      expect(result.ok).toBe(false);
      if (result.ok) return;

      // Should still have property, but no sourceContext
      expect(result.issues[0]).toMatchObject({
        code: "invalid-value",
        message: "Invalid segment",
        property: "test-multi",
      });
      expect(result.issues[0]?.sourceContext).toBeUndefined();
    });

    it("should format pointer alignment correctly", () => {
      defineProperty({
        name: "color",
        syntax: "<color>",
        parser: (node: csstree.Value): ParseResult<never> => {
          const location = node.loc
            ? {
                source: node.loc.source,
                start: node.loc.start,
                end: node.loc.end,
              }
            : undefined;

          return parseErr(createError("invalid-value", "Invalid", { location }));
        },
        inherited: true,
        initial: "black",
      });

      const result = parseDeclaration("color: red green blue");

      expect(result.ok).toBe(false);
      if (result.ok) return;

      const context = result.issues[0]?.sourceContext;
      expect(context).toBeDefined();

      // Should have line number prefix (e.g., "   1 | ")
      expect(context).toMatch(/\s+\d+\s+\|/);

      // Should have pointer on separate line
      expect(context).toContain("\n");
      expect(context).toMatch(/\^/);
    });

    it("should enrich all issues (multiple errors)", () => {
      defineProperty({
        name: "test-prop",
        syntax: "<test>",
        parser: (node: csstree.Value): ParseResult<never> => {
          const location = node.loc
            ? {
                source: node.loc.source,
                start: node.loc.start,
                end: node.loc.end,
              }
            : undefined;

          return {
            ok: false,
            issues: [
              createError("invalid-value", "Error 1", { location }),
              createError("invalid-syntax", "Error 2", { location }),
            ],
          };
        },
        inherited: false,
        initial: "none",
      });

      const result = parseDeclaration("test-prop: invalid");

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.issues).toHaveLength(2);

      // All issues should have property
      expect(result.issues[0]?.property).toBe("test-prop");
      expect(result.issues[1]?.property).toBe("test-prop");

      // All issues should have sourceContext (if location present)
      expect(result.issues[0]?.sourceContext).toBeDefined();
      expect(result.issues[1]?.sourceContext).toBeDefined();
    });
  });

  describe("issue enrichment - success with warnings", () => {
    it("should enrich warnings on successful parse", () => {
      defineProperty({
        name: "color",
        syntax: "<color>",
        parser: (node: csstree.Value): ParseResult<string> => {
          const value = csstree.generate(node).trim();
          const location = node.loc
            ? {
                source: node.loc.source,
                start: node.loc.start,
                end: node.loc.end,
              }
            : undefined;

          // Success but with warning
          return {
            ok: true,
            value,
            issues: [
              {
                code: "legacy-syntax",
                severity: "warning",
                message: "Consider using modern syntax",
                location,
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
      expect(warning?.sourceContext).toBeDefined();
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
            return parseErr(createError("invalid-value", "All segments invalid"));
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
