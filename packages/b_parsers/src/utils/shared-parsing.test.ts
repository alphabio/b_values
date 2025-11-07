// b_path:: packages/b_parsers/src/utils/shared-parsing.test.ts
import { describe, expect, it } from "vitest";
import * as SharedParsing from "./shared-parsing";

describe("Gradient Shared Parsing Utilities", () => {
  describe("parseCssToGradientFunction", () => {
    it("finds linear-gradient function", () => {
      const css = "linear-gradient(red, blue)";

      const result = SharedParsing.parseCssToGradientFunction(css, ["linear-gradient", "repeating-linear-gradient"]);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.name).toBe("linear-gradient");
    });

    it("finds repeating-radial-gradient function", () => {
      const css = "repeating-radial-gradient(red, blue)";

      const result = SharedParsing.parseCssToGradientFunction(css, ["radial-gradient", "repeating-radial-gradient"]);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.name).toBe("repeating-radial-gradient");
    });

    it("fails on wrong function name", () => {
      const css = "conic-gradient(red, blue)";

      const result = SharedParsing.parseCssToGradientFunction(css, ["linear-gradient", "repeating-linear-gradient"]);

      expect(result.ok).toBe(false);
    });

    it("fails on invalid CSS", () => {
      const css = "not valid css {{{";

      const result = SharedParsing.parseCssToGradientFunction(css, ["linear-gradient"]);

      expect(result.ok).toBe(false);
    });
  });

  describe("validateParentheses", () => {
    it("returns undefined for balanced parentheses", () => {
      const css = "linear-gradient(red, blue)";

      const issue = SharedParsing.validateParentheses(css, "linear");

      expect(issue).toBeUndefined();
    });

    it("returns warning for missing closing parenthesis", () => {
      const css = "linear-gradient(red, blue";

      const issue = SharedParsing.validateParentheses(css, "linear");

      expect(issue).toBeDefined();
      expect(issue?.severity).toBe("warning");
      expect(issue?.message).toContain("Unbalanced parentheses");
    });

    it("returns warning for missing opening parenthesis", () => {
      const css = "red, blue)";

      const issue = SharedParsing.validateParentheses(css, "radial");

      expect(issue).toBeDefined();
      expect(issue?.severity).toBe("warning");
    });

    it("returns undefined for nested balanced parentheses", () => {
      const css = "linear-gradient(var(--color, red), blue)";

      const issue = SharedParsing.validateParentheses(css, "linear");

      expect(issue).toBeUndefined();
    });
  });
});
