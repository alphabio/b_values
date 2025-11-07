// b_path:: packages/b_keywords/src/bg-size.test.ts

import { describe, it, expect } from "vitest";
import { BG_SIZE, bgSize, type BgSize as BgSizeKeyword } from "./bg-size";

describe("BG_SIZE", () => {
  it("should contain auto", () => {
    expect(BG_SIZE).toContain("auto");
  });

  it("should contain cover", () => {
    expect(BG_SIZE).toContain("cover");
  });

  it("should contain contain", () => {
    expect(BG_SIZE).toContain("contain");
  });

  it("should have exactly 3 keywords", () => {
    expect(BG_SIZE).toHaveLength(3);
  });
});

describe("bgSize", () => {
  it("should parse valid keywords", () => {
    expect(bgSize.safeParse("auto").success).toBe(true);
    expect(bgSize.safeParse("cover").success).toBe(true);
    expect(bgSize.safeParse("contain").success).toBe(true);
  });

  it("should reject invalid keywords", () => {
    expect(bgSize.safeParse("fill").success).toBe(false);
    expect(bgSize.safeParse("stretch").success).toBe(false);
    expect(bgSize.safeParse("").success).toBe(false);
  });

  it("should be case-sensitive", () => {
    expect(bgSize.safeParse("Auto").success).toBe(false);
    expect(bgSize.safeParse("Cover").success).toBe(false);
    expect(bgSize.safeParse("CONTAIN").success).toBe(false);
  });
});

describe("BgSize type", () => {
  it("should accept valid keywords", () => {
    const valid: BgSizeKeyword[] = ["auto", "cover", "contain"];
    expect(valid).toHaveLength(3);
  });
});
