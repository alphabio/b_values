// b_path:: packages/b_declarations/src/core/parser.test.ts
import { describe, expect, it, beforeEach } from "vitest";
import { parseDeclaration } from "./parser";
import { propertyRegistry, defineProperty } from "./registry";
import { parseOk, parseErr, createError, type ParseResult } from "@b/types";

describe("parseDeclaration", () => {
  beforeEach(() => {
    propertyRegistry.clear();
  });

  describe("string input", () => {
    it("should parse declaration string with semicolon", () => {
      defineProperty({
        name: "color",
        syntax: "<color>",
        parser: (value: string): ParseResult<string> => parseOk(value.trim()),
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
        parser: (value: string): ParseResult<string> => parseOk(value.trim()),
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
        parser: (value: string): ParseResult<string> => parseOk(value.trim()),
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
        parser: (value: string): ParseResult<string> => parseOk(value.trim()),
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
});
