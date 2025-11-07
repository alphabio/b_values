// b_path:: packages/b_declarations/src/properties/custom-property/parser.test.ts
import { describe, it, expect } from "vitest";
import { parseCustomProperty } from "./parser";

describe("parseCustomProperty", () => {
  describe("complex values", () => {
    it("should parse box-shadow value", () => {
      const result = parseCustomProperty("3px 6px rgb(20 32 54)");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("raw");
        expect(result.value.value).toBe("3px 6px rgb(20 32 54)");
      }
    });

    it("should parse gradient", () => {
      const result = parseCustomProperty("linear-gradient(red, blue)");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe("linear-gradient(red, blue)");
      }
    });

    it("should parse calc expression", () => {
      const result = parseCustomProperty("calc(100% - 20px)");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe("calc(100% - 20px)");
      }
    });

    it("should parse border shorthand", () => {
      const result = parseCustomProperty("1px solid red");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe("1px solid red");
      }
    });

    it("should preserve internal whitespace", () => {
      const result = parseCustomProperty("10px  20px   30px");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe("10px  20px   30px");
      }
    });
  });

  describe("whitespace handling", () => {
    it("should handle leading whitespace", () => {
      const result = parseCustomProperty("  blue");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe("blue");
      }
    });

    it("should handle trailing whitespace", () => {
      const result = parseCustomProperty("blue  ");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe("blue");
      }
    });

    it("should handle both leading and trailing whitespace", () => {
      const result = parseCustomProperty("  blue  ");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe("blue");
      }
    });
  });

  describe("edge cases", () => {
    it("should reject empty value", () => {
      const result = parseCustomProperty("");

      expect(result.ok).toBe(false);
    });

    it("should reject whitespace-only value", () => {
      const result = parseCustomProperty("   ");

      expect(result.ok).toBe(false);
    });

    it("should parse single character", () => {
      const result = parseCustomProperty("a");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe("a");
      }
    });

    it("should parse numbers with decimals", () => {
      const result = parseCustomProperty("3.14159");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe("3.14159");
      }
    });

    it("should parse negative numbers", () => {
      const result = parseCustomProperty("-10px");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe("-10px");
      }
    });
  });
});
