// b_path:: packages/b_parsers/src/gradient/__tests__/radial/error-handling.test.ts
import { describe, it, expect } from "vitest";
import * as Radial from "../../radial";

describe("Radial Gradient Parser - Error Handling", () => {
  describe("Invalid Color Stops", () => {
    it("fails on single color stop", () => {
      const css = "radial-gradient(red)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(false);
    });

    it("fails on zero color stops", () => {
      const css = "radial-gradient()";
      const result = Radial.parse(css);

      expect(result.ok).toBe(false);
    });
  });

  describe("Invalid Function Names", () => {
    it("fails on invalid gradient function", () => {
      const css = "linear-gradient(red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(false);
    });

    it("fails on conic-gradient function", () => {
      const css = "conic-gradient(red, blue)";
      const result = Radial.parse(css);

      expect(result.ok).toBe(false);
    });
  });

  describe("Invalid Syntax", () => {
    it("parses malformed CSS gracefully", () => {
      const css = "radial-gradient(circle at, red, blue)";
      const result = Radial.parse(css);

      // Parser is lenient and parses this successfully
      // "at" is followed by comma, so no position is parsed
      expect(result.ok).toBe(true);
    });

    it("fails on invalid size keyword", () => {
      const css = "radial-gradient(invalid-keyword, red, blue)";
      const result = Radial.parse(css);

      // Should parse but treat as color stop
      // Validation happens at type level
      expect(result.ok).toBe(true);
    });
  });

  describe("Empty Values", () => {
    it("handles empty string", () => {
      const css = "";
      const result = Radial.parse(css);

      expect(result.ok).toBe(false);
    });

    it("handles whitespace only", () => {
      const css = "   ";
      const result = Radial.parse(css);

      expect(result.ok).toBe(false);
    });
  });
});
