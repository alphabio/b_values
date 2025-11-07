// b_path:: packages/b_keywords/src/bg-size.test.ts

import { describe, it, expect } from "vitest";
import { BG_SIZE_KEYWORDS, bgSizeKeywordSchema, type BgSizeKeyword } from "./bg-size";

describe("BG_SIZE_KEYWORDS", () => {
  it("should contain auto", () => {
    expect(BG_SIZE_KEYWORDS).toContain("auto");
  });

  it("should contain cover", () => {
    expect(BG_SIZE_KEYWORDS).toContain("cover");
  });

  it("should contain contain", () => {
    expect(BG_SIZE_KEYWORDS).toContain("contain");
  });

  it("should have exactly 3 keywords", () => {
    expect(BG_SIZE_KEYWORDS).toHaveLength(3);
  });
});

describe("bgSizeKeywordSchema", () => {
  it("should parse valid keywords", () => {
    expect(bgSizeKeywordSchema.safeParse("auto").success).toBe(true);
    expect(bgSizeKeywordSchema.safeParse("cover").success).toBe(true);
    expect(bgSizeKeywordSchema.safeParse("contain").success).toBe(true);
  });

  it("should reject invalid keywords", () => {
    expect(bgSizeKeywordSchema.safeParse("fill").success).toBe(false);
    expect(bgSizeKeywordSchema.safeParse("stretch").success).toBe(false);
    expect(bgSizeKeywordSchema.safeParse("").success).toBe(false);
  });

  it("should be case-sensitive", () => {
    expect(bgSizeKeywordSchema.safeParse("Auto").success).toBe(false);
    expect(bgSizeKeywordSchema.safeParse("Cover").success).toBe(false);
    expect(bgSizeKeywordSchema.safeParse("CONTAIN").success).toBe(false);
  });
});

describe("BgSizeKeyword type", () => {
  it("should accept valid keywords", () => {
    const valid: BgSizeKeyword[] = ["auto", "cover", "contain"];
    expect(valid).toHaveLength(3);
  });
});
