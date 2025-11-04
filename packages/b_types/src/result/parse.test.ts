import { describe, expect, it } from "vitest";
import { createError, createWarning } from "./issue";
import { addIssue, combineResults, parseErr, parseOk } from "./parse";

describe("ParseResult", () => {
  describe("parseOk()", () => {
    it("should create successful parse result", () => {
      const result = parseOk({ kind: "hex", value: "#FF0000" });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({ kind: "hex", value: "#FF0000" });
      }
      expect(result.issues).toEqual([]);
      expect(result.property).toBeUndefined();
    });

    it("should include property when provided", () => {
      const result = parseOk({ kind: "hex", value: "#FF0000" }, "background-color");
      expect(result.property).toBe("background-color");
    });

    it("should work with primitive values", () => {
      const stringResult = parseOk("test");
      expect(stringResult.ok).toBe(true);
      if (stringResult.ok) {
        expect(stringResult.value).toBe("test");
      }

      const numberResult = parseOk(42);
      expect(numberResult.ok).toBe(true);
      if (numberResult.ok) {
        expect(numberResult.value).toBe(42);
      }
    });

    it("should work with null and undefined", () => {
      const nullResult = parseOk(null);
      expect(nullResult.ok).toBe(true);
      if (nullResult.ok) {
        expect(nullResult.value).toBeNull();
      }

      const undefinedResult = parseOk(undefined);
      expect(undefinedResult.ok).toBe(true);
      if (undefinedResult.ok) {
        expect(undefinedResult.value).toBeUndefined();
      }
    });
  });

  describe("parseErr()", () => {
    it("should create failed parse result", () => {
      const issue = createError("invalid-value", "Invalid color");
      const result = parseErr(issue);

      expect(result.ok).toBe(false);
      expect(result.value).toBeUndefined();
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0]).toBe(issue);
      expect(result.property).toBeUndefined();
    });

    it("should include property when provided", () => {
      const issue = createError("invalid-value", "Invalid color");
      const result = parseErr(issue, "color");

      expect(result.property).toBe("color");
    });

    it("should work with different issue types", () => {
      const error = createError("invalid-syntax", "Syntax error");
      const warning = createWarning("deprecated-syntax", "Old syntax");

      const errorResult = parseErr(error);
      expect(errorResult.ok).toBe(false);
      expect(errorResult.issues[0].severity).toBe("error");

      const warningResult = parseErr(warning);
      expect(warningResult.ok).toBe(false);
      expect(warningResult.issues[0].severity).toBe("warning");
    });
  });

  describe("addIssue()", () => {
    it("should add issue to successful result", () => {
      const result = parseOk({ value: 10 });
      const warning = createWarning("deprecated-syntax", "Use modern syntax");
      const withIssue = addIssue(result, warning);

      expect(withIssue.ok).toBe(true);
      expect(withIssue.issues).toHaveLength(1);
      expect(withIssue.issues[0]).toBe(warning);
      if (withIssue.ok) {
        expect(withIssue.value).toEqual({ value: 10 });
      }
    });

    it("should add issue to failed result", () => {
      const error = createError("invalid-value", "Invalid");
      const result = parseErr(error);
      const warning = createWarning("deprecated-syntax", "Also deprecated");
      const withIssue = addIssue(result, warning);

      expect(withIssue.ok).toBe(false);
      expect(withIssue.issues).toHaveLength(2);
      expect(withIssue.issues[0]).toBe(error);
      expect(withIssue.issues[1]).toBe(warning);
    });

    it("should preserve property", () => {
      const result = parseOk({ value: 10 }, "width");
      const warning = createWarning("legacy-syntax", "Old format");
      const withIssue = addIssue(result, warning);

      expect(withIssue.property).toBe("width");
    });

    it("should support chaining", () => {
      const result = parseOk({ value: 10 });
      const warning1 = createWarning("deprecated-syntax", "Warning 1");
      const warning2 = createWarning("legacy-syntax", "Warning 2");

      const withIssues = addIssue(addIssue(result, warning1), warning2);

      expect(withIssues.ok).toBe(true);
      expect(withIssues.issues).toHaveLength(2);
    });
  });

  describe("combineResults()", () => {
    it("should combine successful results", () => {
      const result1 = parseOk({ value: 1 });
      const result2 = parseOk({ value: 2 });
      const result3 = parseOk({ value: 3 });

      const combined = combineResults([result1, result2, result3]);

      expect(combined.ok).toBe(true);
      if (combined.ok) {
        expect(combined.value).toHaveLength(3);
        expect(combined.value).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
      }
      expect(combined.issues).toEqual([]);
    });

    it("should fail if any result fails", () => {
      const result1 = parseOk({ value: 1 });
      const result2 = parseErr(createError("invalid-value", "Error"));
      const result3 = parseOk({ value: 3 });

      const combined = combineResults([result1, result2, result3]);

      expect(combined.ok).toBe(false);
      expect(combined.value).toBeUndefined();
      expect(combined.issues).toHaveLength(1);
    });

    it("should collect all issues", () => {
      const warning1 = createWarning("deprecated-syntax", "Warning 1");
      const warning2 = createWarning("legacy-syntax", "Warning 2");
      const error = createError("invalid-value", "Error");

      const result1 = addIssue(parseOk({ value: 1 }), warning1);
      const result2 = addIssue(parseOk({ value: 2 }), warning2);
      const result3 = parseErr(error);

      const combined = combineResults([result1, result2, result3]);

      expect(combined.ok).toBe(false);
      expect(combined.issues).toHaveLength(3);
      expect(combined.issues[0]).toBe(warning1);
      expect(combined.issues[1]).toBe(warning2);
      expect(combined.issues[2]).toBe(error);
    });

    it("should handle empty array", () => {
      const combined = combineResults([]);
      expect(combined.ok).toBe(true);
      if (combined.ok) {
        expect(combined.value).toEqual([]);
      }
      expect(combined.issues).toEqual([]);
    });

    it("should preserve warnings in successful combine", () => {
      const warning = createWarning("deprecated-syntax", "Warning");
      const result1 = addIssue(parseOk({ value: 1 }), warning);
      const result2 = parseOk({ value: 2 });

      const combined = combineResults([result1, result2]);

      expect(combined.ok).toBe(true);
      expect(combined.issues).toHaveLength(1);
      expect(combined.issues[0]).toBe(warning);
    });

    it("should work with different value types", () => {
      const stringResult = parseOk("test");
      const numberResult = parseOk(42);
      const boolResult = parseOk(true);

      // Type test - these should have correct types
      const stringCombined = combineResults([stringResult]);
      const numberCombined = combineResults([numberResult]);
      const boolCombined = combineResults([boolResult]);

      expect(stringCombined.ok).toBe(true);
      expect(numberCombined.ok).toBe(true);
      expect(boolCombined.ok).toBe(true);
    });
  });
});
