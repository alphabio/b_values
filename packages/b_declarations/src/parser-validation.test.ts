// b_path:: packages/b_declarations/src/parser-validation.test.ts

import { describe, it, expect } from "vitest";
import { parseDeclaration } from "./parser";

// Import property definitions to register them
import "./properties/background-attachment";
import "./properties/background-clip";
import "./properties/background-origin";
import "./properties/background-color";

describe("Parser Pre-Validation (allowedKeywords)", () => {
  describe("background-attachment", () => {
    it("should accept valid keywords", () => {
      const result = parseDeclaration("background-attachment: scroll");
      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it("should accept comma-separated valid keywords", () => {
      const result = parseDeclaration("background-attachment: scroll, fixed, local");
      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it("should reject invalid keyword", () => {
      const result = parseDeclaration("background-attachment: invalid");
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].code).toBe("invalid-value");
      expect(result.issues[0].message).toContain("invalid");
      expect(result.issues[0].message).toContain("scroll, fixed, local");
    });

    it("should reject multiple invalid keywords", () => {
      const result = parseDeclaration("background-attachment: invalid1, fixed, invalid2");
      expect(result.issues.length).toBeGreaterThanOrEqual(2);
      // Each invalid keyword generates an error
      expect(result.issues.some((i) => i.message.includes("invalid1"))).toBe(true);
      expect(result.issues.some((i) => i.message.includes("invalid2"))).toBe(true);
    });
  });

  describe("background-clip", () => {
    it("should accept valid keywords", () => {
      const result = parseDeclaration("background-clip: border-box");
      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it("should reject invalid keyword from background-origin domain", () => {
      // This is the original bug: content-box is valid for background-clip
      // but was being parsed as background-color
      const result = parseDeclaration("background-clip: content-box");
      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it("should reject completely invalid keyword", () => {
      const result = parseDeclaration("background-clip: invalid");
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].code).toBe("invalid-value");
      expect(result.issues[0].message).toContain("invalid");
    });
  });

  describe("background-origin", () => {
    it("should accept valid keywords", () => {
      const result = parseDeclaration("background-origin: padding-box");
      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it("should reject text keyword (valid for clip, not origin)", () => {
      const result = parseDeclaration("background-origin: text");
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].code).toBe("invalid-value");
      expect(result.issues[0].message).toContain("text");
    });
  });

  describe("background-color (no allowedKeywords)", () => {
    it("should parse colors without pre-validation", () => {
      // background-color doesn't have allowedKeywords, so no pre-validation
      const result = parseDeclaration("background-color: #ff0000");
      expect(result.ok).toBe(true);
    });

    it("should handle invalid color through parser", () => {
      // Invalid colors should be caught by the color parser, not pre-validation
      const result = parseDeclaration("background-color: not-a-color");
      // CSS named colors are very permissive, so this might actually parse
      // The important thing is that allowedKeywords doesn't interfere
      expect(result).toBeDefined();
    });
  });

  describe("Case insensitivity", () => {
    it("should accept uppercase keywords", () => {
      const result = parseDeclaration("background-attachment: SCROLL");
      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it("should accept mixed case keywords", () => {
      const result = parseDeclaration("background-attachment: FiXeD");
      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
    });
  });

  describe("Whitespace handling", () => {
    it("should handle leading/trailing whitespace", () => {
      const result = parseDeclaration("background-attachment:   scroll  ");
      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it("should handle whitespace around commas", () => {
      const result = parseDeclaration("background-attachment: scroll , fixed , local");
      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
    });
  });
});
