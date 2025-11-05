// b_path:: packages/b_declarations/src/utils/keywords.test.ts
import { describe, expect, it } from "vitest";
import { isCSSWideKeyword, parseCSSWideKeyword, CSS_WIDE_KEYWORDS } from "./keywords";

describe("CSS-wide keywords", () => {
  describe("isCSSWideKeyword", () => {
    it("should recognize all CSS-wide keywords", () => {
      for (const keyword of CSS_WIDE_KEYWORDS) {
        expect(isCSSWideKeyword(keyword)).toBe(true);
      }
    });

    it("should reject non-keywords", () => {
      expect(isCSSWideKeyword("red")).toBe(false);
      expect(isCSSWideKeyword("auto")).toBe(false);
      expect(isCSSWideKeyword("none")).toBe(false);
    });
  });

  describe("parseCSSWideKeyword", () => {
    it("should parse valid keywords", () => {
      const result = parseCSSWideKeyword("inherit");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("inherit");
    });

    it("should normalize case", () => {
      const result = parseCSSWideKeyword("INHERIT");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("inherit");
    });

    it("should trim whitespace", () => {
      const result = parseCSSWideKeyword("  initial  ");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("initial");
    });

    it("should fail for non-keywords", () => {
      const result = parseCSSWideKeyword("red");
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.issues[0]?.message).toContain("Not a CSS-wide keyword");
    });
  });
});
