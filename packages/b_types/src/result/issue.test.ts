// b_path:: packages/b_types/src/result/issue.test.ts
import { describe, expect, it } from "vitest";
import type { IssueCode } from "./issue";
import { createError, createInfo, createWarning } from "./issue";

describe("Issue system", () => {
  describe("createError()", () => {
    it("should create error issue with code and message", () => {
      const issue = createError("invalid-value", "Invalid color");
      expect(issue.code).toBe("invalid-value");
      expect(issue.severity).toBe("error");
      expect(issue.message).toBe("Invalid color");
      expect(issue.property).toBeUndefined();
      expect(issue.suggestion).toBeUndefined();
      expect(issue.location).toBeUndefined();
    });

    it("should include property when provided", () => {
      const issue = createError("invalid-value", "Invalid color", {
        property: "background-color",
      });
      expect(issue.property).toBe("background-color");
    });

    it("should include suggestion when provided", () => {
      const issue = createError("invalid-syntax", "Missing closing paren", {
        suggestion: "Add closing parenthesis",
      });
      expect(issue.suggestion).toBe("Add closing parenthesis");
    });

    it("should include location when provided", () => {
      const issue = createError("invalid-value", "Invalid character", {
        location: { offset: 5, length: 1 },
      });
      expect(issue.location).toEqual({ offset: 5, length: 1 });
    });

    it("should include all options when provided", () => {
      const issue = createError("invalid-value", "Invalid hex color", {
        property: "color",
        suggestion: "Use #RRGGBB format",
        location: { offset: 10, length: 4 },
      });
      expect(issue.code).toBe("invalid-value");
      expect(issue.severity).toBe("error");
      expect(issue.message).toBe("Invalid hex color");
      expect(issue.property).toBe("color");
      expect(issue.suggestion).toBe("Use #RRGGBB format");
      expect(issue.location).toEqual({ offset: 10, length: 4 });
    });
  });

  describe("createWarning()", () => {
    it("should create warning issue with code and message", () => {
      const issue = createWarning("deprecated-syntax", "Old syntax used");
      expect(issue.code).toBe("deprecated-syntax");
      expect(issue.severity).toBe("warning");
      expect(issue.message).toBe("Old syntax used");
    });

    it("should include property when provided", () => {
      const issue = createWarning("legacy-syntax", "Legacy format", {
        property: "transform",
      });
      expect(issue.property).toBe("transform");
    });

    it("should include suggestion when provided", () => {
      const issue = createWarning("deprecated-syntax", "Use modern syntax", {
        suggestion: "Replace with oklch()",
      });
      expect(issue.suggestion).toBe("Replace with oklch()");
    });

    it("should include all options", () => {
      const issue = createWarning("duplicate-property", "Property declared twice", {
        property: "color",
        suggestion: "Remove duplicate",
        location: { offset: 20, length: 5 },
      });
      expect(issue.severity).toBe("warning");
      expect(issue.property).toBe("color");
      expect(issue.suggestion).toBe("Remove duplicate");
      expect(issue.location).toEqual({ offset: 20, length: 5 });
    });
  });

  describe("createInfo()", () => {
    it("should create info issue with code and message", () => {
      const issue = createInfo("legacy-syntax", "Consider updating");
      expect(issue.code).toBe("legacy-syntax");
      expect(issue.severity).toBe("info");
      expect(issue.message).toBe("Consider updating");
    });

    it("should include property when provided", () => {
      const issue = createInfo("legacy-syntax", "Old format detected", {
        property: "background-image",
      });
      expect(issue.property).toBe("background-image");
    });

    it("should include suggestion when provided", () => {
      const issue = createInfo("deprecated-syntax", "New syntax available", {
        suggestion: "Use modern approach",
      });
      expect(issue.suggestion).toBe("Use modern approach");
    });
  });

  describe("IssueCode extensibility", () => {
    it("should allow typed issue codes", () => {
      const parseCode: IssueCode = "invalid-value";
      const generateCode: IssueCode = "invalid-ir";
      const warningCode: IssueCode = "deprecated-syntax";

      expect(parseCode).toBe("invalid-value");
      expect(generateCode).toBe("invalid-ir");
      expect(warningCode).toBe("deprecated-syntax");
    });

    it("should work with custom codes via module augmentation", () => {
      // This test demonstrates the pattern, actual augmentation happens in other packages
      const customCode = "invalid-gradient" as IssueCode;
      const issue = createError(customCode, "Invalid gradient");
      expect(issue.code).toBe("invalid-gradient");
    });
  });

  describe("SourceLocation", () => {
    it("should track character offsets", () => {
      const issue = createError("invalid-syntax", "Unexpected token", {
        location: { offset: 0, length: 1 },
      });
      expect(issue.location?.offset).toBe(0);
      expect(issue.location?.length).toBe(1);
    });

    it("should support multi-character locations", () => {
      const issue = createError("invalid-value", "Invalid keyword", {
        location: { offset: 10, length: 6 },
      });
      expect(issue.location?.offset).toBe(10);
      expect(issue.location?.length).toBe(6);
    });
  });
});
