// b_path:: packages/b_types/src/result/generate.test.ts
import { describe, expect, it } from "vitest";
import { createError, createWarning } from "./issue";
import { addGenerateIssue, combineGenerateResults, generateErr, generateOk, prependPathToIssues } from "./generate";

describe("GenerateResult", () => {
  describe("generateOk()", () => {
    it("should create successful generate result", () => {
      const result = generateOk("#ff0000");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("#ff0000");
      }
      expect(result.issues).toEqual([]);
      expect(result.property).toBeUndefined();
    });

    it("should include property when provided", () => {
      const result = generateOk("#ff0000", "background-color");
      expect(result.property).toBe("background-color");
    });

    it("should work with complex CSS strings", () => {
      const gradient = "linear-gradient(45deg, red 0%, blue 100%)";
      const result = generateOk(gradient);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(gradient);
      }
    });

    it("should work with empty string", () => {
      const result = generateOk("");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("");
      }
    });
  });

  describe("generateErr()", () => {
    it("should create failed generate result", () => {
      const issue = createError("invalid-ir", "Invalid IR structure");
      const result = generateErr(issue);

      expect(result.ok).toBe(false);
      expect(result.value).toBeUndefined();
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0]).toBe(issue);
      expect(result.property).toBeUndefined();
    });

    it("should include property when provided", () => {
      const issue = createError("invalid-ir", "Invalid IR");
      const result = generateErr(issue, "color");

      expect(result.property).toBe("color");
    });

    it("should work with different issue types", () => {
      const error = createError("missing-required-field", "Missing 'kind' field");
      const warning = createWarning("deprecated-syntax", "Old IR format");

      const errorResult = generateErr(error);
      expect(errorResult.ok).toBe(false);
      expect(errorResult.issues[0].severity).toBe("error");

      const warningResult = generateErr(warning);
      expect(warningResult.ok).toBe(false);
      expect(warningResult.issues[0].severity).toBe("warning");
    });
  });

  describe("addGenerateIssue()", () => {
    it("should add issue to successful result", () => {
      const result = generateOk("#ff0000");
      const warning = createWarning("deprecated-syntax", "Use modern syntax");
      const withIssue = addGenerateIssue(result, warning);

      expect(withIssue.ok).toBe(true);
      expect(withIssue.issues).toHaveLength(1);
      expect(withIssue.issues[0]).toBe(warning);
      if (withIssue.ok) {
        expect(withIssue.value).toBe("#ff0000");
      }
    });

    it("should add issue to failed result", () => {
      const error = createError("invalid-ir", "Invalid");
      const result = generateErr(error);
      const warning = createWarning("deprecated-syntax", "Also deprecated");
      const withIssue = addGenerateIssue(result, warning);

      expect(withIssue.ok).toBe(false);
      expect(withIssue.issues).toHaveLength(2);
      expect(withIssue.issues[0]).toBe(error);
      expect(withIssue.issues[1]).toBe(warning);
    });

    it("should preserve property", () => {
      const result = generateOk("10px", "width");
      const warning = createWarning("legacy-syntax", "Old format");
      const withIssue = addGenerateIssue(result, warning);

      expect(withIssue.property).toBe("width");
    });

    it("should support chaining", () => {
      const result = generateOk("#ff0000");
      const warning1 = createWarning("deprecated-syntax", "Warning 1");
      const warning2 = createWarning("legacy-syntax", "Warning 2");

      const withIssues = addGenerateIssue(addGenerateIssue(result, warning1), warning2);

      expect(withIssues.ok).toBe(true);
      expect(withIssues.issues).toHaveLength(2);
    });
  });

  describe("combineGenerateResults()", () => {
    it("should combine successful results with default separator", () => {
      const result1 = generateOk("red");
      const result2 = generateOk("blue");
      const result3 = generateOk("green");

      const combined = combineGenerateResults([result1, result2, result3]);

      expect(combined.ok).toBe(true);
      if (combined.ok) {
        expect(combined.value).toBe("red, blue, green");
      }
      expect(combined.issues).toEqual([]);
    });

    it("should combine with custom separator", () => {
      const result1 = generateOk("10px");
      const result2 = generateOk("20px");

      const combined = combineGenerateResults([result1, result2], " ");

      expect(combined.ok).toBe(true);
      if (combined.ok) {
        expect(combined.value).toBe("10px 20px");
      }
    });

    it("should fail if any result fails", () => {
      const result1 = generateOk("red");
      const result2 = generateErr(createError("invalid-ir", "Error"));
      const result3 = generateOk("blue");

      const combined = combineGenerateResults([result1, result2, result3]);

      expect(combined.ok).toBe(false);
      expect(combined.value).toBeUndefined();
      expect(combined.issues).toHaveLength(1);
    });

    it("should collect all issues", () => {
      const warning1 = createWarning("deprecated-syntax", "Warning 1");
      const warning2 = createWarning("legacy-syntax", "Warning 2");
      const error = createError("invalid-ir", "Error");

      const result1 = addGenerateIssue(generateOk("red"), warning1);
      const result2 = addGenerateIssue(generateOk("blue"), warning2);
      const result3 = generateErr(error);

      const combined = combineGenerateResults([result1, result2, result3]);

      expect(combined.ok).toBe(false);
      expect(combined.issues).toHaveLength(3);
      expect(combined.issues[0]).toBe(warning1);
      expect(combined.issues[1]).toBe(warning2);
      expect(combined.issues[2]).toBe(error);
    });

    it("should handle empty array", () => {
      const combined = combineGenerateResults([]);
      expect(combined.ok).toBe(true);
      if (combined.ok) {
        expect(combined.value).toBe("");
      }
      expect(combined.issues).toEqual([]);
    });

    it("should preserve warnings in successful combine", () => {
      const warning = createWarning("deprecated-syntax", "Warning");
      const result1 = addGenerateIssue(generateOk("red"), warning);
      const result2 = generateOk("blue");

      const combined = combineGenerateResults([result1, result2]);

      expect(combined.ok).toBe(true);
      if (combined.ok) {
        expect(combined.value).toBe("red, blue");
      }
      expect(combined.issues).toHaveLength(1);
      expect(combined.issues[0]).toBe(warning);
    });

    it("should work with semicolon separator (declaration blocks)", () => {
      const result1 = generateOk("color: red");
      const result2 = generateOk("font-size: 16px");

      const combined = combineGenerateResults([result1, result2], "; ");

      expect(combined.ok).toBe(true);
      if (combined.ok) {
        expect(combined.value).toBe("color: red; font-size: 16px");
      }
    });

    it("should work with newline separator", () => {
      const result1 = generateOk("line1");
      const result2 = generateOk("line2");

      const combined = combineGenerateResults([result1, result2], "\n");

      expect(combined.ok).toBe(true);
      if (combined.ok) {
        expect(combined.value).toBe("line1\nline2");
      }
    });
  });

  describe("prependPathToIssues()", () => {
    it("should prepend path to issue without existing path", () => {
      const error = createError("invalid-ir", "Invalid structure");
      const result = generateErr(error);

      const withPath = prependPathToIssues(result, ["colorStops", 0, "color"]);

      expect(withPath.ok).toBe(false);
      expect(withPath.issues).toHaveLength(1);
      expect(withPath.issues[0].path).toEqual(["colorStops", 0, "color"]);
    });

    it("should prepend path to issue with existing path", () => {
      const error = createError("invalid-ir", "Invalid structure");
      error.path = ["type"];
      const result = generateErr(error);

      const withPath = prependPathToIssues(result, ["gradients", 1]);

      expect(withPath.ok).toBe(false);
      expect(withPath.issues).toHaveLength(1);
      expect(withPath.issues[0].path).toEqual(["gradients", 1, "type"]);
    });

    it("should handle empty path prefix", () => {
      const error = createError("invalid-ir", "Invalid structure");
      error.path = ["value"];
      const result = generateErr(error);

      const withPath = prependPathToIssues(result, []);

      expect(withPath.ok).toBe(false);
      expect(withPath).toBe(result); // Should return same object
    });

    it("should work with successful results", () => {
      const warning = createWarning("deprecated-syntax", "Old format");
      warning.path = ["unit"];
      const result = addGenerateIssue(generateOk("#ff0000"), warning);

      const withPath = prependPathToIssues(result, ["styles", "color"]);

      expect(withPath.ok).toBe(true);
      if (withPath.ok) {
        expect(withPath.value).toBe("#ff0000");
      }
      expect(withPath.issues).toHaveLength(1);
      expect(withPath.issues[0].path).toEqual(["styles", "color", "unit"]);
    });

    it("should handle multiple issues", () => {
      const error1 = createError("invalid-ir", "Error 1");
      error1.path = ["field1"];
      const error2 = createError("missing-required-field", "Error 2");
      error2.path = ["field2"];
      const result = generateErr([error1, error2]);

      const withPath = prependPathToIssues(result, ["root"]);

      expect(withPath.ok).toBe(false);
      expect(withPath.issues).toHaveLength(2);
      expect(withPath.issues[0].path).toEqual(["root", "field1"]);
      expect(withPath.issues[1].path).toEqual(["root", "field2"]);
    });

    it("should preserve other issue properties", () => {
      const error = createError("invalid-ir", "Invalid structure");
      error.path = ["type"];
      error.suggestion = "Try using 'solid'";
      error.expected = "string";
      error.received = "number";
      const result = generateErr(error, "background-color");

      const withPath = prependPathToIssues(result, ["gradients", 1]);

      expect(withPath.issues[0].message).toBe("Invalid structure");
      expect(withPath.issues[0].suggestion).toBe("Try using 'solid'");
      expect(withPath.issues[0].expected).toBe("string");
      expect(withPath.issues[0].received).toBe("number");
      expect(withPath.property).toBe("background-color");
    });
  });
});
