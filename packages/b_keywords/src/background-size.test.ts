// b_path:: packages/b_keywords/src/background-size.test.ts

import { describe, it, expect } from "vitest";
import { BACKGROUND_SIZE_KEYWORDS, isBackgroundSizeKeyword, type BackgroundSizeKeyword } from "./background-size";

describe("BACKGROUND_SIZE_KEYWORDS", () => {
  it("should contain cover", () => {
    expect(BACKGROUND_SIZE_KEYWORDS).toContain("cover");
  });

  it("should contain contain", () => {
    expect(BACKGROUND_SIZE_KEYWORDS).toContain("contain");
  });

  it("should contain auto", () => {
    expect(BACKGROUND_SIZE_KEYWORDS).toContain("auto");
  });

  it("should have exactly 3 keywords", () => {
    expect(BACKGROUND_SIZE_KEYWORDS).toHaveLength(3);
  });
});

describe("isBackgroundSizeKeyword", () => {
  it("should return true for valid keywords", () => {
    expect(isBackgroundSizeKeyword("cover")).toBe(true);
    expect(isBackgroundSizeKeyword("contain")).toBe(true);
    expect(isBackgroundSizeKeyword("auto")).toBe(true);
  });

  it("should return false for invalid keywords", () => {
    expect(isBackgroundSizeKeyword("fill")).toBe(false);
    expect(isBackgroundSizeKeyword("stretch")).toBe(false);
    expect(isBackgroundSizeKeyword("")).toBe(false);
    expect(isBackgroundSizeKeyword("100px")).toBe(false);
  });

  it("should be case-sensitive", () => {
    expect(isBackgroundSizeKeyword("Cover")).toBe(false);
    expect(isBackgroundSizeKeyword("CONTAIN")).toBe(false);
  });
});

describe("BackgroundSizeKeyword type", () => {
  it("should accept valid keywords", () => {
    const valid: BackgroundSizeKeyword[] = ["cover", "contain", "auto"];
    expect(valid).toHaveLength(3);
  });
});
