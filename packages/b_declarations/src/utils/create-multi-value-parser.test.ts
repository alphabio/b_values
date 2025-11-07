// b_path:: packages/b_declarations/src/utils/create-multi-value-parser.test.ts
import { describe, it, expect } from "vitest";
import { createMultiValueParser } from "./create-multi-value-parser";
import { parseOk, parseErr, createError } from "@b/types";
import * as csstree from "@eslint/css-tree";

// Test types
interface TestItem {
  value: string;
}

interface TestResult {
  items: TestItem[];
}

describe("createMultiValueParser", () => {
  describe("basic functionality", () => {
    it("should parse single item", () => {
      const parser = createMultiValueParser<TestItem, TestResult>({
        itemParser: (node) => parseOk({ value: csstree.generate(node) }),
        aggregator: (items) => ({ items }),
      });

      const result = parser("red");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.items).toHaveLength(1);
      expect(result.value.items[0].value).toBe("red");
    });

    it("should parse multiple comma-separated items", () => {
      const parser = createMultiValueParser<TestItem, TestResult>({
        itemParser: (node) => parseOk({ value: csstree.generate(node) }),
        aggregator: (items) => ({ items }),
      });

      const result = parser("red, blue, green");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.items).toHaveLength(3);
      expect(result.value.items[0].value).toBe("red");
      expect(result.value.items[1].value).toBe("blue");
      expect(result.value.items[2].value).toBe("green");
    });

    it("should handle whitespace around items", () => {
      const parser = createMultiValueParser<TestItem, TestResult>({
        itemParser: (node) => parseOk({ value: csstree.generate(node) }),
        aggregator: (items) => ({ items }),
      });

      const result = parser("  red  ,   blue   ,   green  ");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.items).toHaveLength(3);
    });
  });

  describe("preParse handler", () => {
    it("should handle keywords before list parsing", () => {
      const parser = createMultiValueParser<TestItem, TestResult>({
        preParse: (value) => {
          if (value === "none") return parseOk({ items: [] });
          return null;
        },
        itemParser: (node) => parseOk({ value: csstree.generate(node) }),
        aggregator: (items) => ({ items }),
      });

      const result = parser("none");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.items).toHaveLength(0);
    });

    it("should skip preParse and continue to list parsing", () => {
      const parser = createMultiValueParser<TestItem, TestResult>({
        preParse: (value) => {
          if (value === "none") return parseOk({ items: [] });
          return null; // Continue to list parsing
        },
        itemParser: (node) => parseOk({ value: csstree.generate(node) }),
        aggregator: (items) => ({ items }),
      });

      const result = parser("red, blue");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.items).toHaveLength(2);
    });
  });

  describe("incomplete consumption detection (missing comma bug)", () => {
    it("should detect missing comma between items", () => {
      const parser = createMultiValueParser<TestItem, TestResult>({
        itemParser: (node) => parseOk({ value: csstree.generate(node) }),
        aggregator: (items) => ({ items }),
      });

      // Missing comma between "red" and "blue"
      const result = parser("red blue");

      expect(result.ok).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].code).toBe("invalid-syntax");
      expect(result.issues[0].message).toContain("missing comma");
      expect(result.issues[0].message).toContain("blue");
    });

    it("should detect unparsed content after function", () => {
      const parser = createMultiValueParser<TestItem, TestResult>({
        itemParser: (node) => parseOk({ value: csstree.generate(node) }),
        aggregator: (items) => ({ items }),
      });

      // Missing comma after calc()
      const result = parser("calc(50% + 10px) red");

      expect(result.ok).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].code).toBe("invalid-syntax");
      expect(result.issues[0].message).toContain("missing comma");
    });

    it("should truncate long unparsed content in error message", () => {
      const parser = createMultiValueParser<TestItem, TestResult>({
        itemParser: (node) => parseOk({ value: csstree.generate(node) }),
        aggregator: (items) => ({ items }),
      });

      const longContent = "a".repeat(100);
      const result = parser(`red ${longContent}`);

      expect(result.ok).toBe(false);
      expect(result.issues[0].message).toContain("...");
      expect(result.issues[0].message.length).toBeLessThan(200);
    });
  });

  describe("resilience (partial failure)", () => {
    it("should collect valid items when one item fails", () => {
      const parser = createMultiValueParser<TestItem, TestResult>({
        itemParser: (node) => {
          const value = csstree.generate(node);
          if (value === "bad") {
            return parseErr(createError("invalid-value", "Bad value"));
          }
          return parseOk({ value });
        },
        aggregator: (items) => ({ items }),
      });

      const result = parser("red, bad, blue");

      expect(result.ok).toBe(false); // Has issues
      expect(result.value?.items).toHaveLength(2); // But has 2 valid items
      expect(result.value?.items[0].value).toBe("red");
      expect(result.value?.items[1].value).toBe("blue");
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].message).toBe("Bad value");
    });

    it("should continue parsing after syntax error in one item", () => {
      const parser = createMultiValueParser<TestItem, TestResult>({
        itemParser: (node) => parseOk({ value: csstree.generate(node) }),
        aggregator: (items) => ({ items }),
      });

      // Note: css-tree is quite forgiving, so truly malformed syntax is rare
      // This tests the try/catch around css-tree.parse()
      const result = parser("red, , blue"); // Empty item

      expect(result.value?.items).toHaveLength(2); // red and blue parsed
      expect(result.value?.items[0].value).toBe("red");
      expect(result.value?.items[1].value).toBe("blue");
    });

    it("should aggregate all issues from all items", () => {
      const parser = createMultiValueParser<TestItem, TestResult>({
        itemParser: (node) => {
          const value = csstree.generate(node);
          if (value === "bad1") {
            return parseErr(createError("invalid-value", "Error 1"));
          }
          if (value === "bad2") {
            return parseErr(createError("invalid-value", "Error 2"));
          }
          return parseOk({ value });
        },
        aggregator: (items) => ({ items }),
      });

      const result = parser("red, bad1, blue, bad2, green");

      expect(result.ok).toBe(false);
      expect(result.value?.items).toHaveLength(3); // red, blue, green
      expect(result.issues).toHaveLength(2);
      expect(result.issues[0].message).toBe("Error 1");
      expect(result.issues[1].message).toBe("Error 2");
    });
  });

  describe("edge cases", () => {
    it("should handle empty string", () => {
      const parser = createMultiValueParser<TestItem, TestResult>({
        itemParser: (node) => parseOk({ value: csstree.generate(node) }),
        aggregator: (items) => ({ items }),
      });

      const result = parser("");

      expect(result.ok).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].message).toContain("No valid list items");
    });

    it("should handle whitespace-only string", () => {
      const parser = createMultiValueParser<TestItem, TestResult>({
        itemParser: (node) => parseOk({ value: csstree.generate(node) }),
        aggregator: (items) => ({ items }),
      });

      const result = parser("   ");

      expect(result.ok).toBe(false);
      expect(result.issues).toHaveLength(1);
    });

    it("should handle trailing comma", () => {
      const parser = createMultiValueParser<TestItem, TestResult>({
        itemParser: (node) => parseOk({ value: csstree.generate(node) }),
        aggregator: (items) => ({ items }),
      });

      const result = parser("red, blue,");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.items).toHaveLength(2); // Trailing comma ignored
    });

    it("should return ok: false when all items fail", () => {
      const parser = createMultiValueParser<TestItem, TestResult>({
        itemParser: () => parseErr(createError("invalid-value", "All fail")),
        aggregator: (items) => ({ items }),
      });

      const result = parser("red, blue");

      expect(result.ok).toBe(false);
      expect(result.value).toBeUndefined();
      expect(result.issues).toHaveLength(2);
    });

    it("should handle complex nested functions", () => {
      const parser = createMultiValueParser<TestItem, TestResult>({
        itemParser: (node) => parseOk({ value: csstree.generate(node) }),
        aggregator: (items) => ({ items }),
      });

      const result = parser("calc(50% + 10px), rgba(0, 0, 0, 0.5), url(img.png)");

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.items).toHaveLength(3);
    });
  });

  describe("integration with background-image use case", () => {
    it("should handle gradient with missing comma", () => {
      const parser = createMultiValueParser<TestItem, TestResult>({
        itemParser: (node) => parseOk({ value: csstree.generate(node).substring(0, 20) }),
        aggregator: (items) => ({ items }),
      });

      // Simulating the bug: two gradients without comma
      const result = parser("linear-gradient(red, blue) radial-gradient(red, blue)");

      expect(result.ok).toBe(false);
      expect(result.issues[0].message).toContain("missing comma");
      expect(result.issues[0].message).toContain("radial-gradient");
    });
  });
});
